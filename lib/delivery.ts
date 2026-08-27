export const LISTING_DELIVERY_METHODS = [
  "shipping",
  "pickup",
  "both",
] as const;

export const TRANSACTION_DELIVERY_METHODS = [
  "shipping",
  "pickup",
] as const;

export type ListingDeliveryMethod =
  (typeof LISTING_DELIVERY_METHODS)[number];

export type TransactionDeliveryMethod =
  (typeof TRANSACTION_DELIVERY_METHODS)[number];

export function isListingDeliveryMethod(
  value: unknown,
): value is ListingDeliveryMethod {
  return typeof value === "string" &&
    LISTING_DELIVERY_METHODS.includes(
      value as ListingDeliveryMethod,
    );
}

export function isTransactionDeliveryMethod(
  value: unknown,
): value is TransactionDeliveryMethod {
  return typeof value === "string" &&
    TRANSACTION_DELIVERY_METHODS.includes(
      value as TransactionDeliveryMethod,
    );
}

export function supportsDeliveryMethod(
  available: unknown,
  selected: unknown,
) {
  return (
    isListingDeliveryMethod(available) &&
    isTransactionDeliveryMethod(selected) &&
    (available === "both" || available === selected)
  );
}
