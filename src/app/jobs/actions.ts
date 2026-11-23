"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { analyzePosting, tailorResume, writeCoverLetter } from "@/lib/ai";
import {
  buildProfileText,
  computeFitScore,
  findMissingKeywords,
} from "@/lib/analysis";
import {
  DAILY_ANALYSIS_LIMIT,
  countJobsSince,
  createJob,
  deleteJob,
  getJob,
} from "@/lib/jobs-data";
import {
  getProfile,
  listEducation,
  listExperiences,
  listProjects,
  listSkillGroups,
} from "@/lib/profile-data";
import { requireUser } from "@/lib/session";
import {
  buildSourceText,
  buildTailoringInput,
  sanitizeTailored,
} from "@/lib/resume";
import {
  assembleLetter,
  letterBodySchema,
  sanitizeParagraphs,
} from "@/lib/cover-letter";
import {
  DAILY_LETTER_LIMIT,
  countCoverLettersSince,
  saveCoverLetter,
  updateCoverLetterBody,
} from "@/lib/cover-letter-data";
import {
  DAILY_RESUME_LIMIT,
  countResumesSince,
  loadResumeSource,
  saveResume,
} from "@/lib/resume-data";

export type AnalyzeState = { error?: string; postingText?: string } | null;

const MIN_LENGTH = 200;
const MAX_LENGTH = 15000;

export async function analyzeJobAction(
  _prev: AnalyzeState,
  form: FormData
): Promise<AnalyzeState> {
  const user = await requireUser();
  const postingText = String(form.get("postingText") ?? "").trim();

  if (postingText.length < MIN_LENGTH) {
    return {
      postingText,
      error: "Paste the full job posting, including the requirements.",
    };
  }
  if (postingText.length > MAX_LENGTH) {
    return {
      postingText,
      error: "That posting is too long. Keep it under 15,000 characters.",
    };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if ((await countJobsSince(user.id, since)) >= DAILY_ANALYSIS_LIMIT) {
    return {
      postingText,
      error: `You've reached today's limit of ${DAILY_ANALYSIS_LIMIT} analyses. Try again tomorrow.`,
    };
  }

  const [profile, experiences, projects, education, skills] = await Promise.all(
    [
      getProfile(user.id),
      listExperiences(user.id),
      listProjects(user.id),
      listEducation(user.id),
      listSkillGroups(user.id),
    ]
  );

  if (experiences.length + projects.length + skills.length === 0) {
    return {
      postingText,
      error:
        "Add some work experience, projects, or skills to your profile first, so there's something to compare the posting to.",
    };
  }

  const profileText = buildProfileText({
    profile,
    experiences,
    projects,
    education,
    skills,
  });

  let result;
  try {
    result = await analyzePosting({ postingText, profileText });
  } catch (error) {
    console.error("Job analysis failed", error);
    return {
      postingText,
      error: "We couldn't analyze this posting right now. Try again in a moment.",
    };
  }

  const { analysis, model } = result;
  const id = await createJob(user.id, {
    title: analysis.jobTitle.slice(0, 200) || "Untitled role",
    company: analysis.company.slice(0, 200) || "Unknown",
    postingText,
    analysis,
    missingKeywords: findMissingKeywords(analysis.keywords, profileText),
    fitScore: computeFitScore(analysis.requirements),
    model,
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${id}`);
}

export async function deleteJobAction(id: string) {
  const user = await requireUser();
  if (z.uuid().safeParse(id).success) {
    await deleteJob(user.id, id);
  }
  revalidatePath("/jobs");
}

export type ResumeState = { error?: string } | null;

export async function generateResumeAction(jobId: string): Promise<ResumeState> {
  const user = await requireUser();
  if (!z.uuid().safeParse(jobId).success) {
    return { error: "That job no longer exists." };
  }
  const row = await getJob(user.id, jobId);
  if (!row) return { error: "That job no longer exists." };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if ((await countResumesSince(user.id, since)) >= DAILY_RESUME_LIMIT) {
    return {
      error: `You've reached today's limit of ${DAILY_RESUME_LIMIT} resumes. Try again tomorrow.`,
    };
  }

  const source = await loadResumeSource(user.id);
  if (source.experiences.length + source.projects.length === 0) {
    return { error: "Add work experience or projects to your profile first." };
  }

  let result;
  try {
    result = await tailorResume({
      postingText: row.postingText,
      analysis: row.analysis,
      sourceText: buildTailoringInput(source),
    });
  } catch (error) {
    console.error("Resume tailoring failed", error);
    return { error: "We couldn't write the resume right now. Try again in a moment." };
  }

  const { tailored, warnings } = sanitizeTailored(result.tailored, source);
  await saveResume(user.id, jobId, { tailored, warnings, model: result.model });

  revalidatePath(`/jobs/${jobId}/resume`);
  redirect(`/jobs/${jobId}/resume`);
}

export type LetterState = {
  error?: string;
  message?: string;
  body?: string;
} | null;

export async function generateCoverLetterAction(
  jobId: string
): Promise<ResumeState> {
  const user = await requireUser();
  if (!z.uuid().safeParse(jobId).success) {
    return { error: "That job no longer exists." };
  }
  const row = await getJob(user.id, jobId);
  if (!row) return { error: "That job no longer exists." };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if ((await countCoverLettersSince(user.id, since)) >= DAILY_LETTER_LIMIT) {
    return {
      error: `You've reached today's limit of ${DAILY_LETTER_LIMIT} cover letters. Try again tomorrow.`,
    };
  }

  const source = await loadResumeSource(user.id);
  if (source.experiences.length + source.projects.length === 0) {
    return { error: "Add work experience or projects to your profile first." };
  }

  let result;
  try {
    result = await writeCoverLetter({
      postingText: row.postingText,
      analysis: row.analysis,
      company: row.company,
      sourceText: buildSourceText(source, false),
    });
  } catch (error) {
    console.error("Cover letter failed", error);
    return { error: "We couldn't write the letter right now. Try again in a moment." };
  }

  const { paragraphs, warnings } = sanitizeParagraphs(result.paragraphs, source);
  if (paragraphs.length === 0) {
    return { error: "The draft didn't pass our checks. Try generating it again." };
  }

  const name = source.profile?.fullName || user.name;
  await saveCoverLetter(user.id, jobId, {
    body: assembleLetter(paragraphs, name),
    warnings,
    model: result.model,
  });

  revalidatePath(`/jobs/${jobId}/cover-letter`);
  redirect(`/jobs/${jobId}/cover-letter`);
}

export async function saveCoverLetterAction(
  letterId: string,
  jobId: string,
  _prev: LetterState,
  form: FormData
): Promise<LetterState> {
  const user = await requireUser();
  const body = String(form.get("body") ?? "").replace(/\r\n/g, "\n");

  const parsed = letterBodySchema.safeParse(body);
  if (!parsed.success) {
    return { body, error: parsed.error.issues[0]?.message ?? "Check the letter and try again." };
  }
  if (!z.uuid().safeParse(letterId).success) {
    return { body, error: "That letter no longer exists." };
  }

  const saved = await updateCoverLetterBody(user.id, letterId, parsed.data);
  if (!saved) return { body, error: "That letter no longer exists." };

  if (z.uuid().safeParse(jobId).success) {
    revalidatePath(`/jobs/${jobId}/cover-letter`);
  }
  return { body: parsed.data, message: "Saved." };
}