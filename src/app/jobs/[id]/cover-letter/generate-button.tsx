"use client";

import { useActionState } from "react";
import {
  generateCoverLetterAction,
  type ResumeState,
} from "@/app/jobs/actions";
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
    generateCoverLetterAction.bind(null, jobId),
    null
  );
  const text = pending ? "Writing your letter…" : label;

  return (
    <form action={action} className="flex items-center gap-3">
      {secondary ? (
        <button
          disabled={pending}
          className={`${secondaryButtonClass} disabled:opacity-60`}
        >
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