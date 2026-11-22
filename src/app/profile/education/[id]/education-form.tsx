"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveEducationAction, type FormState } from "@/app/profile/actions";
import {
  Button,
  Field,
  TextArea,
  secondaryButtonClass,
} from "@/components/form";

export type EducationDefaults = {
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string;
};

export function EducationForm({
  id,
  defaults,
}: {
  id: string;
  defaults: EducationDefaults;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveEducationAction.bind(null, id),
    null
  );
  const err = (k: string) => state?.errors?.[k]?.[0];
  const val = (k: keyof EducationDefaults) => state?.values?.[k] ?? defaults[k];

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <Field label="School" name="school" required
        defaultValue={val("school")} error={err("school")} />
      <Field label="Degree" name="degree" required
        hint="For example, Bachelor of Science."
        defaultValue={val("degree")} error={err("degree")} />
      <Field label="Field of study" name="field"
        defaultValue={val("field")} error={err("field")} />
      <Field label="Location" name="location"
        defaultValue={val("location")} error={err("location")} />
      <Field label="Start month" name="startDate" type="month"
        defaultValue={val("startDate")} error={err("startDate")} />
      <Field label="End or graduation month" name="endDate" type="month"
        hint="Leave empty if you haven't finished."
        defaultValue={val("endDate")} error={err("endDate")} />
      <TextArea label="Highlights" name="highlights" rows={5}
        wrapperClassName="sm:col-span-2"
        hint="Optional. One line each, like honors or relevant coursework."
        defaultValue={val("highlights")} error={err("highlights")} />
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save education"}
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