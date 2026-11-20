import Link from "next/link";
import { Logo } from "./logo";
import { ThreadSpiral } from "./thread-spiral";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Link href="/" className="w-fit">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-ink-soft">{footer}</p>
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