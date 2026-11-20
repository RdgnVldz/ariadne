import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Dashboard" };

function Shell({
  right,
  children,
}: {
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/15">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Logo />
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-14">{children}</main>
    </div>
  );
}

async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const firstName = session.user.name.split(" ")[0];

  return (
    <Shell
      right={
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-ink-soft sm:inline">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      }
    >
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome, {firstName}
      </h1>
      <div className="mt-10 border-l-2 border-thread pl-6">
        <h2 className="text-lg font-semibold">Start with your master profile</h2>
        <p className="mt-1 max-w-md text-ink-soft">
          Add your work history, skills, and projects once. Every resume and
          cover letter starts from it.
        </p>
      </div>
    </Shell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Shell />}>
      <Dashboard />
    </Suspense>
  );
}