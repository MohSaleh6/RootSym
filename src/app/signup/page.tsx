import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/user-auth";
import { googleEnabled } from "@/lib/google-oauth";
import SignUpView from "./SignUpView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a RootSym account to reserve a seat on a live workshop.",
  robots: { index: false },
};

type Search = { searchParams: Promise<{ next?: string }> };

export default async function SignUpPage({ searchParams }: Search) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "";

  if (await getUserSession()) redirect(safeNext || "/account");

  return <SignUpView next={safeNext} google={googleEnabled()} />;
}
