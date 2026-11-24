import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { linkClass, secondaryButtonClass } from "@/components/form";
import { followUpsDue, profileChecklist, stageCounts } from "@/lib/dashboard";
import { formatIsoDate, todayInZone } from "@/lib/format";
import { STATUSES, STATUS_LABEL } from "@/lib/job-status";
import { loadResumeSource } from "@/lib/resume-data";
import { requireUser } from "@/lib/session";
import { listTrackerJobs } from "@/lib/tracker-data";

export const metadata: Metadata = { title: "Dashboard" };

async function Overview() {
  const user = await requireUser();
  const [source, jobs] = await Promise.all([
    loadResumeSource(user.id),
    listTrackerJobs(user.id),
  ]);

  const firstName = user.name.split(" ")[0];
  const checklist = profileChecklist(source);
  const doneCount = checklist.filter((item) => item.done).length;
  const complete = doneCount === checklist.length;
  const counts = stageCounts(jobs);
  const due = followUpsDue(jobs, todayInZone());
  const recent = jobs.slice(0, 5);

  const profileSection = complete ? null : (
    <section className="border-l-2 border-thread pl-6">
      <h2 className="text-lg font-semibold">Complete your profile</h2>
      <p className="mt-1 max-w-lg text-sm text-ink-soft">
        {doneCount} of {checklist.length} done. Every resume and letter is built
        from your profile, so a fuller profile gives better drafts.
      </p>
      <div className="mt-3 h-1.5 w-full max-w-xs bg-ink/15">
        <div
          className="h-full bg-thread"
          style={{ width: `${(doneCount / checklist.length) * 100}%` }}
        />
      </div>
      <ul className="mt-4 text-sm">
        {checklist.map((item) => (
          <li key={item.id}>
            {item.done ? (
              <>Done: {item.label}</>
            ) : (
              <>
                To do:{" "}
                <Link href="/profile" className={linkClass}>
                  {item.label}
                </Link>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome, {firstName}
      </h1>
      <p className="mt-4">
        <Link href="/jobs" className={secondaryButtonClass}>
          Analyze a job posting
        </Link>
      </p>

      {!complete && <div className="mt-10">{profileSection}</div>}

      {due.length > 0 && (
        <section className="mt-10 border-l-2 border-thread pl-6">
          <h2 className="text-lg font-semibold">Follow up now</h2>
          <ul className="mt-2">
            {due.map((job) => (
              <li key={job.id} className="text-sm">
                <Link href={`/jobs/${job.id}`} className={linkClass}>
                  {job.title}, {job.company}
                </Link>{" "}
                <span className="text-ink-soft">
                  (due {formatIsoDate(job.followUpOn!)})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Pipeline</h2>
          <Link href="/tracker" className={linkClass}>
            Open tracker
          </Link>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {STATUSES.map((status) => (
            <div key={status} className="border-t border-ink/30 pt-2">
              <dt className="text-sm text-ink-soft">{STATUS_LABEL[status]}</dt>
              <dd className="text-2xl font-semibold">{counts[status]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-3 max-w-md text-ink-soft">
            No jobs yet.{" "}
            <Link href="/jobs" className={linkClass}>
              Analyze a job posting
            </Link>{" "}
            to see how well your profile fits it.
          </p>
        ) : (
          <ul className="mt-3">
            {recent.map((job) => (
              <li
                key={job.id}
                className="flex items-start justify-between gap-4 border-t border-ink/15 py-3 first:border-t-0"
              >
                <div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-ink-soft">{job.company}</p>
                </div>
                <p className="shrink-0 text-right text-sm text-ink-soft">
                  {STATUS_LABEL[job.status]}
                  {job.fitScore !== null ? `, fit ${job.fitScore}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {complete && <div className="mt-12">{profileSection}</div>}
    </>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Overview />
      </Suspense>
    </AppShell>
  );
}