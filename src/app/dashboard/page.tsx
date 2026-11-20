import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { linkClass } from "@/components/form";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

async function Welcome() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome, {firstName}
      </h1>
      <div className="mt-10 border-l-2 border-thread pl-6">
        <h2 className="text-lg font-semibold">Start with your master profile</h2>
        <p className="mt-1 max-w-md text-ink-soft">
          Add your work history, skills, and projects once. Every resume and
          cover letter starts from it.
        </p>
        <p className="mt-3">
          <Link href="/profile" className={linkClass}>
            Open your profile
          </Link>
        </p>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Welcome />
      </Suspense>
    </AppShell>
  );
}