import type { Config, Context } from "@netlify/functions";
import { invokeInternalCron } from "./_shared/invoke-internal-cron";

export default async (_request: Request, context: Context): Promise<void> => {
  await invokeInternalCron("/api/cron/draw-raffles", context);
};

export const config: Config = {
  schedule: "30 3 * * *",
};
