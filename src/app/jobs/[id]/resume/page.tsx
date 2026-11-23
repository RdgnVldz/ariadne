import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { ResumeView } from "@/components/resume-view";
import { getJob } from "@/lib/jobs-data";
import { buildResumeDoc, resumeToText, runAtsChecks } from "@/lib/resume";
import { getResume, loadResumeSource } from "@/lib/resume-data";
import { requireUser } from "@/lib/session";
import { GenerateButton } from "./generate-button";
import { PrintButton } from "@/components/print-button";
import { linkClass, secondaryButtonClass } from "@/components/form";

export const metadata: Metadata = { title: "Tailored resume" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!z.uuid().safeParse(id).success) notFound();
  const job = await getJob(user.id, id);
  if (!job) notFound();

  const [saved, source] = await Promise.all([
    getResume(user.id, id),
    loadResumeSource(user.id),
  ]);

  const back = (
    <p className="mb-6 text-sm print:hidden">
      <Link href={`/jobs/${id}`} className={linkClass}>
        Back to the job analysis
      </Link>
    </p>
  );

  if (!saved) {
    return (
      <>
        {back}
        <h1 className="text-3xl font-semibold tracking-tight">
          Tailored resume for {job.title}
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Ariadne rewrites and reorders what&apos;s already in your profile to match
          this posting. Your employers, titles, dates, and education are copied
          exactly, and nothing you haven&apos;t written is added.
        </p>
        <div className="mt-8">
          <GenerateButton jobId={id} label="Generate resume" />
        </div>
      </>
    );
  }

  const doc = buildResumeDoc(source, saved.tailored, {
    name: user.name,
    email: user.email,
  });
  const ats = runAtsChecks(doc, job.analysis.keywords);

  return (
    <>
      <div className="print:hidden">
        {back}
        <h1 className="text-3xl font-semibold tracking-tight">
          Tailored resume for {job.title}
        </h1>
        <p className="mt-1 text-ink-soft">{job.company}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PrintButton />
          <a
            href={`/api/jobs/${id}/resume/docx`}
            download
            className={secondaryButtonClass}
          >
            Download Word (.docx)
          </a>
          <GenerateButton jobId={id} label="Regenerate" secondary />
        </div>
        <p className="mt-3 max-w-lg text-sm text-ink-soft">
          Read every line before you send it. For a PDF, choose Save as PDF in
          the print window.
        </p>

        {saved.warnings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight">
              Removed from the draft
            </h2>
            <p className="mt-1 max-w-lg text-sm text-ink-soft">
              The AI wrote these, but your profile doesn&apos;t support them, so
              they were left out.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm">
              {saved.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">ATS check</h2>
          <ul className="mt-3 text-sm">
            {ats.checks.map((c) => (
              <li key={c.id}>
                {c.passed ? "Passed" : "Needs attention"}: {c.label}
                {c.detail ? ` (${c.detail})` : ""}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            Covers {ats.keywords.found.length} of {ats.keywords.total} keywords
            from the posting.
          </p>
          {ats.keywords.missing.length > 0 && (
            <p className="mt-1 max-w-lg text-sm text-ink-soft">
              Not in the resume: {ats.keywords.missing.join(", ")}. Add them to
              your profile only if they&apos;re true for you.
            </p>
          )}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">
              How an ATS reads this resume
            </summary>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap border border-ink/15 bg-white p-4 text-sm">
              {resumeToText(doc)}
            </pre>
          </details>
        </section>
      </div>

      <ResumeView doc={doc} />
    </>
  );
}

export default function ResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Content params={params} />
      </Suspense>
    </AppShell>
  );
}