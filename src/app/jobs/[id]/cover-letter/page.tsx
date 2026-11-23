import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { LetterView } from "@/components/letter-view";
import { PrintButton } from "@/components/print-button";
import { wordCount } from "@/lib/cover-letter";
import { getCoverLetter } from "@/lib/cover-letter-data";
import { getJob } from "@/lib/jobs-data";
import { buildResumeDoc } from "@/lib/resume";
import { loadResumeSource } from "@/lib/resume-data";
import { requireUser } from "@/lib/session";
import { GenerateButton } from "./generate-button";
import { LetterEditor } from "./letter-editor";
import { linkClass, secondaryButtonClass } from "@/components/form";

export const metadata: Metadata = { title: "Cover letter" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!z.uuid().safeParse(id).success) notFound();
  const job = await getJob(user.id, id);
  if (!job) notFound();

  const [letter, source] = await Promise.all([
    getCoverLetter(user.id, id),
    loadResumeSource(user.id),
  ]);

  const back = (
    <p className="mb-6 text-sm print:hidden">
      <Link href={`/jobs/${id}`} className={linkClass}>
        Back to the job analysis
      </Link>
    </p>
  );

  if (!letter) {
    return (
      <>
        {back}
        <h1 className="text-3xl font-semibold tracking-tight">
          Cover letter for {job.title}
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Ariadne drafts a letter from what&apos;s in your profile and this posting.
          It won&apos;t invent experience, and you can edit every word before you
          send it.
        </p>
        <div className="mt-8">
          <GenerateButton jobId={id} label="Write cover letter" />
        </div>
      </>
    );
  }

  const doc = buildResumeDoc(source, null, {
    name: user.name,
    email: user.email,
  });

  return (
    <>
      <div className="print:hidden">
        {back}
        <h1 className="text-3xl font-semibold tracking-tight">
          Cover letter for {job.title}
        </h1>
        <p className="mt-1 text-ink-soft">{job.company}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PrintButton />
          <a
            href={`/api/jobs/${id}/cover-letter/docx`}
            download
            className={secondaryButtonClass}
           >
            Download Word (.docx)
          </a>
          <GenerateButton jobId={id} label="Regenerate" secondary />
        </div>
        <p className="mt-3 max-w-lg text-sm text-ink-soft">
          {wordCount(letter.body)} words. Regenerating replaces this version,
          including any edits you made. Add the hiring manager&apos;s name and a
          sentence about why this company before you send it.
        </p>

        {letter.warnings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight">
              Removed from the draft
            </h2>
            <p className="mt-1 max-w-lg text-sm text-ink-soft">
              The AI wrote these, but your profile doesn&apos;t support them, so
              they were left out.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm">
              {letter.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        )}

        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium">
            Edit the text
          </summary>
          <LetterEditor
            key={letter.id}
            letterId={letter.id}
            jobId={id}
            body={letter.body}
          />
        </details>
      </div>

      <LetterView name={doc.name} contact={doc.contact} body={letter.body} />
    </>
  );
}

export default function CoverLetterPage({
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