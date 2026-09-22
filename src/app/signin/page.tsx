import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/user-auth";
import { googleEnabled } from "@/lib/google-oauth";
import SignInView from "./SignInView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your RootSym account to book a seat and find your joining links.",
  robots: { index: false },
};

type Search = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function SignInPage({ searchParams }: Search) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "";

  if (await getUserSession()) redirect(safeNext || "/account");

  return <SignInView next={safeNext} google={googleEnabled()} errorCode={error ?? null} />;
}
