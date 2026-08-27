import { randomInt, timingSafeEqual } from "node:crypto";

export function createPickupConfirmationCode() {
  return randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0");
}

export function hasMatchingValue(
  expectedValue: string,
  suppliedValue: string,
) {
  const expected = Buffer.from(expectedValue);
  const supplied = Buffer.from(suppliedValue);

  return (
    expected.length === supplied.length &&
    timingSafeEqual(expected, supplied)
  );
}

export const hasMatchingConfirmationCode = hasMatchingValue;
