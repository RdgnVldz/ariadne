import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { getEducation } from "@/lib/profile-data";
import { requireUser } from "@/lib/session";
import { EducationForm, type EducationDefaults } from "./education-form";

export const metadata: Metadata = { title: "Education" };

const empty: EducationDefaults = {
  school: "",
  degree: "",
  field: "",
  location: "",
  startDate: "",
  endDate: "",
  highlights: "",
};

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  let defaults = empty;
  if (id !== "new") {
    if (!z.uuid().safeParse(id).success) notFound();
    const row = await getEducation(user.id, id);
    if (!row) notFound();
    defaults = {
      school: row.school,
      degree: row.degree,
      field: row.field ?? "",
      location: row.location ?? "",
      startDate: row.startDate ?? "",
      endDate: row.endDate ?? "",
      highlights: row.highlights.join("\n"),
    };
  }

  return (
    <>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">
        {id === "new" ? "Add education" : "Edit education"}
      </h1>
      <EducationForm id={id} defaults={defaults} />
    </>
  );
}

export default function EducationPage({
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