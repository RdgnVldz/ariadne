import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

// cache() makes the session lookup happen once per request,
// even if several components ask for it.
const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session.user;
}