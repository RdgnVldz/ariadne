"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProjectAction, type FormState } from "@/app/profile/actions";
import {
  Button,
  Field,
  TextArea,
  secondaryButtonClass,
} from "@/components/form";

export type ProjectDefaults = {
  name: string;
  link: string;
  repoUrl: string;
  description: string;
  techStack: string;
  highlights: string;
};

export function ProjectForm({
  id,
  defaults,
}: {
  id: string;
  defaults: ProjectDefaults;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    saveProjectAction.bind(null, id),
    null
  );
  const err = (k: string) => state?.errors?.[k]?.[0];
  const val = (k: keyof ProjectDefaults) => state?.values?.[k] ?? defaults[k];

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <Field label="Project name" name="name" required
        wrapperClassName="sm:col-span-2"
        defaultValue={val("name")} error={err("name")} />
      <Field label="Live site" name="link" type="url"
        hint="Optional. Include https://."
        defaultValue={val("link")} error={err("link")} />
      <Field label="Repository" name="repoUrl" type="url"
        hint="Optional. For example, your GitHub link."
        defaultValue={val("repoUrl")} error={err("repoUrl")} />
      <TextArea label="Description" name="description" rows={3}
        wrapperClassName="sm:col-span-2"
        hint="One or two sentences on what it is and who it's for."
        defaultValue={val("description")} error={err("description")} />
      <Field label="Technologies" name="techStack"
        wrapperClassName="sm:col-span-2"
        hint="Separate with commas, like Next.js, PostgreSQL, Tailwind CSS."
        defaultValue={val("techStack")} error={err("techStack")} />
      <TextArea label="Highlights" name="highlights" rows={6}
        wrapperClassName="sm:col-span-2"
        hint="Optional. One bullet per line, up to 6. Say what you built and the result."
        defaultValue={val("highlights")} error={err("highlights")} />
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save project"}
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