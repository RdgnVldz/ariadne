"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="h-9 rounded-[5px] border border-ink/30 px-3 text-sm font-medium transition-colors hover:border-ink hover:bg-marble-deep"
      onClick={() =>
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/sign-in") },
        })
      }
    >
      Sign out
    </button>
  );
}