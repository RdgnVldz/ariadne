import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { getProject } from "@/lib/profile-data";
import { requireUser } from "@/lib/session";
import { ProjectForm, type ProjectDefaults } from "./project-form";

export const metadata: Metadata = { title: "Project" };

const empty: ProjectDefaults = {
  name: "",
  link: "",
  repoUrl: "",
  description: "",
  techStack: "",
  highlights: "",
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  let defaults = empty;
  if (id !== "new") {
    if (!z.uuid().safeParse(id).success) notFound();
    const row = await getProject(user.id, id);
    if (!row) notFound();
    defaults = {
      name: row.name,
      link: row.link ?? "",
      repoUrl: row.repoUrl ?? "",
      description: row.description ?? "",
      techStack: row.techStack.join(", "),
      highlights: row.highlights.join("\n"),
    };
  }

  return (
    <>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">
        {id === "new" ? "Add a project" : "Edit project"}
      </h1>
      <ProjectForm id={id} defaults={defaults} />
    </>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Content params={params} />
      </Suspense>
    </AppShell>
  );
}