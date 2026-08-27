export const PLATFORM_COMMISSION_RATE = 0.03;

export function calculatePlatformFee(amount: number) {
  return Math.round(amount * PLATFORM_COMMISSION_RATE * 100) / 100;
}

/**
 * The buyer pays the listed price. The seller payout is settled only with
 * server-side values: the locked Garagem164 commission and the exact Stripe
 * processing fee reported for that successful payment.
 */
export function calculateSellerNetAmount(
  grossAmount: number,
  platformFee: number,
  paymentProcessingFee: number,
) {
  return (
    Math.round(
      (grossAmount - platformFee - paymentProcessingFee) * 100,
    ) / 100
  );
}

/**
 * Raffle commission is based strictly on tickets actually paid in one
 * Checkout session. It is intentionally independent from the launch-period
 * promotion used by ordinary listings.
 */
export function calculateRafflePlatformFee(grossPaidTickets: number) {
  return Math.round(grossPaidTickets * PLATFORM_COMMISSION_RATE * 100) / 100;
}
