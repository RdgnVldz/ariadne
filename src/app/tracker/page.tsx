import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { linkClass } from "@/components/form";
import { StatusSelect } from "@/components/status-select";
import { formatIsoDate, todayInZone } from "@/lib/format";
import { STATUSES, STATUS_LABEL } from "@/lib/job-status";
import { requireUser } from "@/lib/session";
import { listTrackerJobs } from "@/lib/tracker-data";
import { followUpsDue } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Tracker" };

async function Board() {
  const user = await requireUser();
  const jobs = await listTrackerJobs(user.id);
  const today = todayInZone();

  if (jobs.length === 0) {
    return (
      <div className="border-l-2 border-thread pl-6">
        <p className="max-w-md text-ink-soft">
          Nothing to track yet.{" "}
          <Link href="/jobs" className={linkClass}>
            Analyze a job posting
          </Link>{" "}
          and it will appear here.
        </p>
      </div>
    );
  }

  const due = followUpsDue(jobs, today);

  return (
    <>
      {due.length > 0 && (
        <section className="mb-12 border-l-2 border-thread pl-6">
          <h2 className="text-lg font-semibold">Follow up now</h2>
          <ul className="mt-2">
            {due.map((j) => (
              <li key={j.id} className="text-sm">
                <Link href={`/jobs/${j.id}`} className={linkClass}>
                  {j.title}, {j.company}
                </Link>{" "}
                <span className="text-ink-soft">
                  (due {formatIsoDate(j.followUpOn!)})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-10 lg:grid-cols-5 lg:gap-6">
        {STATUSES.map((status) => {
          const items = jobs.filter((j) => j.status === status);
          return (
            <section key={status}>
              <h2 className="border-b border-ink/30 pb-2 text-sm font-semibold">
                {STATUS_LABEL[status]}{" "}
                <span className="font-normal text-ink-soft">{items.length}</span>
              </h2>
              <ul>
                {items.map((j) => (
                  <li key={j.id} className="border-b border-ink/15 py-3">
                    <Link
                      href={`/jobs/${j.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {j.title}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      {j.company}
                      {j.fitScore !== null ? `, fit ${j.fitScore}` : ""}
                    </p>
                    {j.appliedOn && (
                      <p className="text-sm text-ink-soft">
                        Applied {formatIsoDate(j.appliedOn)}
                      </p>
                    )}
                    {j.followUpOn && (
                      <p className="text-sm text-ink-soft">
                        Follow up {formatIsoDate(j.followUpOn)}
                      </p>
                    )}
                    <div className="mt-2">
                      <StatusSelect jobId={j.id} status={j.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function TrackerPage() {
  return (
    <AppShell wide>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">Tracker</h1>
      <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
        <Board />
      </Suspense>
    </AppShell>
  );
}