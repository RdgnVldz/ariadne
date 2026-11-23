"use client";

import { useOptimistic, useTransition } from "react";
import { updateJobStatusAction } from "@/app/jobs/actions";
import { STATUSES, STATUS_LABEL, type JobStatus } from "@/lib/job-status";

export function StatusSelect({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const [shown, setShown] = useOptimistic(status);
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-soft">Stage</span>
      <select
        value={shown}
        aria-busy={pending}
        onChange={(e) => {
          const next = e.target.value as JobStatus;
          startTransition(async () => {
            setShown(next);
            await updateJobStatusAction(jobId, next);
          });
        }}
        className="h-9 rounded-[5px] border border-ink/30 bg-white px-2 transition-colors hover:border-ink"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}