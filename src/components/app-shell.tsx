import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { Logo } from "./logo";
import { SignOutButton } from "./sign-out-button";

async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-4">
      <span className="hidden text-sm text-ink-soft sm:inline">{user.email}</span>
      <SignOutButton />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/15">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <Logo />
            </Link>
            <nav className="flex gap-5 text-sm font-medium">
              <Link href="/dashboard" className="underline-offset-4 hover:underline">
                Dashboard
              </Link>
              <Link href="/profile" className="underline-offset-4 hover:underline">
                Profile
              </Link>
            </nav>
          </div>
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-14">{children}</main>
    </div>
  );
}