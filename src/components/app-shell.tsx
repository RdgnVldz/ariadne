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

const navLink = "underline-offset-4 hover:underline";

export function AppShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const width = wide ? "max-w-6xl" : "max-w-4xl";
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/15 print:hidden">
        <div
          className={`mx-auto flex min-h-16 ${width} flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-3`}
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Link href="/dashboard">
              <Logo />
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
              <Link href="/dashboard" className={navLink}>
                Dashboard
              </Link>
              <Link href="/profile" className={navLink}>
                Profile
              </Link>
              <Link href="/jobs" className={navLink}>
                Jobs
              </Link>
              <Link href="/tracker" className={navLink}>
                Tracker
              </Link>
            </nav>
          </div>
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main
        className={`mx-auto ${width} px-6 py-14 print:max-w-none print:p-0`}
      >
        {children}
      </main>
    </div>
  );
}