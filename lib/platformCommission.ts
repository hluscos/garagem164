export const PLATFORM_COMMISSION_RATE = 0.03;

export const COMMISSION_FREE_PERIOD_START = new Date(
  "2026-08-26T00:00:00+01:00",
);

export const COMMISSION_FREE_PERIOD_END = new Date(
  "2026-09-26T00:00:00+01:00",
);

export function isCommissionFreePeriod(now = new Date()) {
  return (
    now >= COMMISSION_FREE_PERIOD_START &&
    now < COMMISSION_FREE_PERIOD_END
  );
}

export function calculatePlatformFee(amount: number, now = new Date()) {
  if (isCommissionFreePeriod(now)) return 0;

  return (
    Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100
  );
}
