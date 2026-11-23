import type { job } from "@/db/schema";
import { StatusSelect } from "@/components/status-select";
import { formatDate } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/job-status";
import { listJobEvents } from "@/lib/tracker-data";
import { ApplicationForm } from "./application-form";

type JobRow = typeof job.$inferSelect;

export async function ApplicationSection({
  userId,
  job: row,
}: {
  userId: string;
  job: JobRow;
}) {
  const events = await listJobEvents(userId, row.id);

  return (
    <section className="mt-14">
      <h2 className="text-xl font-semibold tracking-tight">Application</h2>
      <div className="mt-4">
        <StatusSelect jobId={row.id} status={row.status} />
      </div>

      <div className="mt-6">
        <ApplicationForm
          jobId={row.id}
          defaults={{
            jobUrl: row.jobUrl ?? "",
            appliedOn: row.appliedOn ?? "",
            followUpOn: row.followUpOn ?? "",
            notes: row.notes ?? "",
          }}
        />
      </div>

      <h3 className="mt-10 font-semibold">History</h3>
      <ul className="mt-2 text-sm text-ink-soft">
        {events.map((e) => (
          <li key={e.id}>
            Moved to {STATUS_LABEL[e.toStatus]} on {formatDate(e.createdAt)}
          </li>
        ))}
        <li>Analyzed on {formatDate(row.createdAt)}</li>
      </ul>
    </section>
  );
}