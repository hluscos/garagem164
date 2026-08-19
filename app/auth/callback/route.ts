import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth", requestUrl.origin),
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "SUPABASE AUTH CALLBACK: variáveis de ambiente em falta.",
    );

    return NextResponse.redirect(
      new URL("/login?error=config", requestUrl.origin),
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
  );

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

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