import type { Config, Context } from "@netlify/functions";
import { invokeInternalCron } from "./_shared/invoke-internal-cron";

export default async (_request: Request, context: Context): Promise<void> => {
  await invokeInternalCron("/api/cron/complete-transactions", context);
};

export const config: Config = {
  schedule: "15 3 * * *",
};
