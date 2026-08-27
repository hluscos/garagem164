import type { Context } from "@netlify/functions";

export async function invokeInternalCron(
  path: string,
  context: Context,
): Promise<void> {
  const cronSecret = Netlify.env.get("CRON_SECRET");

  if (!cronSecret) {
    throw new Error("CRON_SECRET is not configured.");
  }

  const siteUrl = context.site.url;

  if (!siteUrl) {
    throw new Error("The scheduled function does not have a site URL.");
  }

  const baseUrl = siteUrl.replace(/^http:/, "https:");
  const response = await fetch(new URL(path, baseUrl), {
    headers: {
      authorization: `Bearer ${cronSecret}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Internal cron ${path} failed with HTTP ${response.status}.`);
  }
}
