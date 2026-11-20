"use client";

import { useActionState } from "react";
import { Button, Field, TextArea } from "@/components/form";
import { saveProfileAction, type FormState } from "./actions";

export type ProfileDefaults = Record<
  | "fullName"
  | "headline"
  | "contactEmail"
  | "phone"
  | "location"
  | "linkedin"
  | "github"
  | "website"
  | "summary",
  string
>;

export function ProfileForm({ defaults }: { defaults: ProfileDefaults }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveProfileAction,
    null
  );
  const err = (k: keyof ProfileDefaults) => state?.errors?.[k]?.[0];
  // React clears uncontrolled fields after a form action, so we hand back
  // what the person typed to keep their input when validation fails.
  const val = (k: keyof ProfileDefaults) => state?.values?.[k] ?? defaults[k];

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <Field label="Full name" name="fullName" autoComplete="name" required
        defaultValue={val("fullName")} error={err("fullName")} />
      <Field label="Headline" name="headline" hint="For example, Full-stack engineer."
        defaultValue={val("headline")} error={err("headline")} />
      <Field label="Contact email" name="contactEmail" type="email"
        defaultValue={val("contactEmail")} error={err("contactEmail")} />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel"
        defaultValue={val("phone")} error={err("phone")} />
      <Field label="Location" name="location" hint="City and country."
        defaultValue={val("location")} error={err("location")} />
      <Field label="LinkedIn" name="linkedin" type="url"
        defaultValue={val("linkedin")} error={err("linkedin")} />
      <Field label="GitHub" name="github" type="url"
        defaultValue={val("github")} error={err("github")} />
      <Field label="Website" name="website" type="url"
        defaultValue={val("website")} error={err("website")} />
      <TextArea label="Summary" name="summary" wrapperClassName="sm:col-span-2"
        hint="Two or three sentences on what you do and what you're looking for."
        defaultValue={val("summary")} error={err("summary")} />
      <div className="flex items-center gap-4 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
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