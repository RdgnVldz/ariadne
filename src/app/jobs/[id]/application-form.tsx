"use client";

import { useActionState } from "react";
import { saveApplicationDetailsAction } from "@/app/jobs/actions";
import type { FormState } from "@/app/profile/actions";
import { Button, Field, TextArea } from "@/components/form";

export type ApplicationDefaults = {
  jobUrl: string;
  appliedOn: string;
  followUpOn: string;
  notes: string;
};

export function ApplicationForm({
  jobId,
  defaults,
}: {
  jobId: string;
  defaults: ApplicationDefaults;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveApplicationDetailsAction.bind(null, jobId),
    null
  );
  const err = (k: string) => state?.errors?.[k]?.[0];
  const val = (k: keyof ApplicationDefaults) =>
    state?.values?.[k] ?? defaults[k];

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <Field
        label="Posting link"
        name="jobUrl"
        type="url"
        wrapperClassName="sm:col-span-2"
        hint="Where you found it, so you can open it again."
        defaultValue={val("jobUrl")}
        error={err("jobUrl")}
      />
      <Field
        label="Applied on"
        name="appliedOn"
        type="date"
        defaultValue={val("appliedOn")}
        error={err("appliedOn")}
      />
      <Field
        label="Follow up on"
        name="followUpOn"
        type="date"
        hint="Shows on the tracker when it is due."
        defaultValue={val("followUpOn")}
        error={err("followUpOn")}
      />
      <TextArea
        label="Notes"
        name="notes"
        rows={5}
        wrapperClassName="sm:col-span-2"
        hint="Contacts, interview dates, questions to ask."
        defaultValue={val("notes")}
        error={err("notes")}
      />
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save details"}
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