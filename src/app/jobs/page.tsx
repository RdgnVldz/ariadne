import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { secondaryButtonClass } from "@/components/form";
import { listJobs } from "@/lib/jobs-data";
import { requireUser } from "@/lib/session";
import { deleteJobAction } from "./actions";
import { AnalyzeForm } from "./analyze-form";

export const metadata: Metadata = { title: "Jobs" };

async function JobList() {
  const user = await requireUser();
  const jobs = await listJobs(user.id);

  if (jobs.length === 0) {
    return (
      <div className="border-l-2 border-thread pl-6">
        <p className="max-w-md text-ink-soft">
          No analyses yet. Paste a job posting above to see how well your
          profile fits it.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {jobs.map((j) => (
        <li
          key={j.id}
          className="flex items-start justify-between gap-4 border-t border-ink/15 py-4 first:border-t-0"
        >
          <div>
            <Link
              href={`/jobs/${j.id}`}
              className="font-semibold underline-offset-4 hover:underline"
            >
              {j.title}
            </Link>
            <p className="text-sm text-ink-soft">
              {j.company},{" "}
              {j.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
              {j.fitScore === null ? "No score" : `${j.fitScore} out of 100`}
            </p>
            <form action={deleteJobAction.bind(null, j.id)}>
              <button className={secondaryButtonClass}>Delete</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function JobsPage() {
  return (
    <AppShell>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">Jobs</h1>
      <AnalyzeForm />
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-semibold tracking-tight">
          Past analyses
        </h2>
        <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
          <JobList />
        </Suspense>
      </section>
    </AppShell>
  );
}