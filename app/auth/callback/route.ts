import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    console.error("OAUTH CALLBACK: código não recebido.");

    return NextResponse.redirect(
      new URL("/login?error=oauth", requestUrl.origin),
    );
  }

  const supabase = await createSupabaseServerClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "OAUTH CALLBACK ERROR:",
      error,
    );

    return NextResponse.redirect(
      new URL("/login?error=oauth", requestUrl.origin),
    );
  }

  return NextResponse.redirect(
    new URL("/", requestUrl.origin),
  );
}