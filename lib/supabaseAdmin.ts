import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("========== SUPABASE ADMIN ==========");
console.log("URL:", url);
console.log("SERVICE ROLE:", key);
console.log(
  "SUPABASE VARS:",
  Object.keys(process.env).filter((k) => k.includes("SUPABASE"))
);
console.log("====================================");

if (!url) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não encontrada.");
}

if (!key) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não encontrada.");
}

export const supabaseAdmin = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});