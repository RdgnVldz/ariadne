import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThreadSpiral } from "@/components/thread-spiral";

export default function Home() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <header className="flex items-center justify-between">
          <Logo />
          <Link
            href="/sign-in"
            className="font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </header>
        <div className="flex max-w-xl flex-1 flex-col justify-center py-16">
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Apply with the right resume, every time.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Add your experience once. Paste a job posting, and Ariadne drafts a
            resume and cover letter that fit it, in a format applicant tracking
            systems can read.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-[5px] bg-ink px-5 font-medium text-marble transition-colors hover:bg-ink-soft"
            >
              Create account
            </Link>
          </div>
        </div>
      </main>
      <aside
        className="hidden bg-ink lg:flex lg:items-center lg:justify-center"
        aria-hidden="true"
      >
        <ThreadSpiral className="h-auto w-full max-w-md" />
      </aside>
    </div>
  );
}