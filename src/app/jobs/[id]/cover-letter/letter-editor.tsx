"use client";

import { useActionState } from "react";
import { saveCoverLetterAction, type LetterState } from "@/app/jobs/actions";
import { Button, TextArea } from "@/components/form";

export function LetterEditor({
  letterId,
  jobId,
  body,
}: {
  letterId: string;
  jobId: string;
  body: string;
}) {
  const [state, action, pending] = useActionState<LetterState, FormData>(
    saveCoverLetterAction.bind(null, letterId, jobId),
    null
  );

  return (
    <form action={action} className="mt-3 flex flex-col gap-4">
      <TextArea
        label="Letter text"
        name="body"
        rows={16}
        defaultValue={state?.body ?? body}
        error={state?.error}
      />
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state?.message && (
          <p role="status" className="text-sm text-ink-soft">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}