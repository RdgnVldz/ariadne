"use client";

import { useActionState } from "react";
import { generateResumeAction, type ResumeState } from "@/app/jobs/actions";
import { Button, secondaryButtonClass } from "@/components/form";

export function GenerateButton({
  jobId,
  label,
  secondary = false,
}: {
  jobId: string;
  label: string;
  secondary?: boolean;
}) {
  const [state, action, pending] = useActionState<ResumeState, FormData>(
    generateResumeAction.bind(null, jobId),
    null
  );
  const text = pending ? "Writing your resume…" : label;

  return (
    <form action={action} className="flex items-center gap-3">
      {secondary ? (
        <button disabled={pending} className={`${secondaryButtonClass} disabled:opacity-60`}>
          {text}
        </button>
      ) : (
        <Button type="submit" disabled={pending}>
          {text}
        </Button>
      )}
      {state?.error && (
        <p role="alert" className="text-sm text-fault">
          {state.error}
        </p>
      )}
    </form>
  );
}