"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { analyzePosting } from "@/lib/ai";
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
} from "@/lib/jobs-data";
import {
  getProfile,
  listEducation,
  listExperiences,
  listProjects,
  listSkillGroups,
} from "@/lib/profile-data";
import { requireUser } from "@/lib/session";

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

export async function deleteJobAction(id: string, _form: FormData) {
  const user = await requireUser();
  if (z.uuid().safeParse(id).success) {
    await deleteJob(user.id, id);
  }
  revalidatePath("/jobs");
}