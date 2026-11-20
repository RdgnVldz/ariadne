"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Button,
  Field,
  TextArea,
  secondaryButtonClass,
} from "@/components/form";
import { saveExperienceAction, type FormState } from "@/app/profile/actions";

export type ExperienceDefaults = {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string;
  current: boolean;
};

export function ExperienceForm({
  id,
  defaults,
}: {
  id: string;
  defaults: ExperienceDefaults;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveExperienceAction.bind(null, id),
    null
  );
  const err = (k: string) => state?.errors?.[k]?.[0];
  const val = (k: keyof Omit<ExperienceDefaults, "current">) =>
    state?.values?.[k] ?? defaults[k];
  const current = state?.values
    ? state.values.current === "on"
    : defaults.current;

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <Field label="Job title" name="title" required
        defaultValue={val("title")} error={err("title")} />
      <Field label="Company" name="company" required
        defaultValue={val("company")} error={err("company")} />
      <Field label="Location" name="location"
        defaultValue={val("location")} error={err("location")} />
      <div className="hidden sm:block" />
      <Field label="Start month" name="startDate" type="month" required
        defaultValue={val("startDate")} error={err("startDate")} />
      <Field label="End month" name="endDate" type="month"
        hint="Leave empty if you still work here."
        defaultValue={val("endDate")} error={err("endDate")} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="current" defaultChecked={current} />
        I currently work here
      </label>
      <TextArea label="Highlights" name="highlights" rows={8}
        wrapperClassName="sm:col-span-2"
        hint="One bullet per line. Start with what you did and end with the result."
        defaultValue={val("highlights")} error={err("highlights")} />
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save role"}
        </Button>
        <Link href="/profile" className={secondaryButtonClass}>
          Cancel
        </Link>
        {state?.message && (
          <p role="alert" className="text-sm text-fault">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}