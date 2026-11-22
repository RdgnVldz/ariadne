"use client";

import { useActionState } from "react";
import { Button, TextArea } from "@/components/form";
import { saveSkillsAction, type FormState } from "./actions";

export function SkillsForm({ defaultValue }: { defaultValue: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveSkillsAction,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextArea
        label="Skills"
        name="skills"
        rows={7}
        hint="One category per line, like “Frontend: React, Next.js, Tailwind CSS”."
        defaultValue={state?.values?.skills ?? defaultValue}
        error={state?.errors?.skills?.[0]}
      />
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save skills"}
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