import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { getExperience } from "@/lib/profile-data";
import { requireUser } from "@/lib/session";
import { ExperienceForm, type ExperienceDefaults } from "./experience-form";

export const metadata: Metadata = { title: "Work experience" };

const empty: ExperienceDefaults = {
  company: "",
  title: "",
  location: "",
  startDate: "",
  endDate: "",
  highlights: "",
  current: false,
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  let defaults = empty;
  if (id !== "new") {
    if (!z.uuid().safeParse(id).success) notFound();
    const row = await getExperience(user.id, id);
    if (!row) notFound();
    defaults = {
      company: row.company,
      title: row.title,
      location: row.location ?? "",
      startDate: row.startDate,
      endDate: row.endDate ?? "",
      highlights: row.highlights.join("\n"),
      current: row.endDate === null,
    };
  }

  return (
    <>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">
        {id === "new" ? "Add a role" : "Edit role"}
      </h1>
      <ExperienceForm id={id} defaults={defaults} />
    </>
  );
}

export default function ExperiencePage({
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