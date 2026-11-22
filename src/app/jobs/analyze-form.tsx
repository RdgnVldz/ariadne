"use client";

import { useActionState } from "react";
import { Button, TextArea } from "@/components/form";
import { analyzeJobAction, type AnalyzeState } from "./actions";

export function AnalyzeForm() {
  const [state, action, pending] = useActionState<AnalyzeState, FormData>(
    analyzeJobAction,
    null
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <TextArea
        label="Job posting"
        name="postingText"
        rows={12}
        hint="Paste the whole posting, including requirements. Analysis takes a few seconds."
        defaultValue={state?.postingText ?? ""}
        error={state?.error}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Analyzing…" : "Analyze posting"}
        </Button>
      </div>
    </form>
  );
}