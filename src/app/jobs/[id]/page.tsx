import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { linkClass, secondaryButtonClass } from "@/components/form";
import type { Requirement } from "@/lib/analysis";
import { getJob } from "@/lib/jobs-data";
import { requireUser } from "@/lib/session";
import { ApplicationSection } from "./application-section";

export const metadata: Metadata = { title: "Job analysis" };

const STATUS_LABEL = {
  strong: "Strong match",
  partial: "Partial match",
  missing: "Not in your profile",
} as const;

function RequirementList({
  title,
  items,
}: {
  title: string;
  items: Requirement[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <ul className="mt-4">
        {items.map((r, i) => (
          <li key={i} className="border-t border-ink/15 py-4 first:border-t-0">
            <p className="font-medium">{r.requirement}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {STATUS_LABEL[r.status]}
              {r.evidence ? `: ${r.evidence}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  if (!z.uuid().safeParse(id).success) notFound();
  const row = await getJob(user.id, id);
  if (!row) notFound();

  const { analysis } = row;
  const required = analysis.requirements.filter((r) => r.importance === "required");
  const preferred = analysis.requirements.filter((r) => r.importance === "preferred");

  return (
    <>
      <p className="mb-6 text-sm">
        <Link href="/jobs" className={linkClass}>
          Back to jobs
        </Link>
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">{row.title}</h1>
      <p className="mt-1 text-ink-soft">
        {row.company}
        {analysis.seniority !== "unspecified" ? `, ${analysis.seniority} level` : ""}
      </p>
      <p className="mt-4 max-w-xl text-ink-soft">{analysis.summary}</p>
      <p className="mt-6 flex flex-wrap gap-3">
        <Link href={`/jobs/${row.id}/resume`} className={secondaryButtonClass}>
          Tailor my resume
        </Link>
        <Link href={`/jobs/${row.id}/cover-letter`} className={secondaryButtonClass}>
          Write cover letter
        </Link>
      </p>

      <div className="mt-10">
        {row.fitScore === null ? (
          <p className="text-ink-soft">No score, because no requirements were found.</p>
        ) : (
          <>
            <p className="text-2xl font-semibold">
              {row.fitScore} <span className="text-base font-normal text-ink-soft">out of 100</span>
            </p>
            <div className="mt-2 h-1.5 w-full max-w-xs bg-ink/15">
              <div className="h-full bg-thread" style={{ width: `${row.fitScore}%` }} />
            </div>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              The share of requirements your profile covers. Required items count
              three times as much as preferred ones, and partial matches count half.
            </p>
          </>
        )}
      </div>

      <RequirementList title="Required" items={required} />
      <RequirementList title="Preferred" items={preferred} />

      {row.missingKeywords.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            Keywords not in your profile
          </h2>
          <p className="mt-2 max-w-md text-sm text-ink-soft">
            These terms appear in the posting but not in your profile. Add them
            only if they&apos;re true for you.
          </p>
          <p className="mt-3">{row.missingKeywords.join(", ")}</p>
        </section>
      )}
      <ApplicationSection userId={user.id} job={row} />
    </>
  );
}

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Content params={params} />
      </Suspense>
    </AppShell>
  );
}