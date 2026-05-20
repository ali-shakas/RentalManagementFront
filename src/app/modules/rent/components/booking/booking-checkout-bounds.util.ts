import { parseFinishWallTimeMs } from './booking-finish/booking-finish-billing.util';
import { resolveCheckoutMs } from './booking-close/booking-close-rules.util';

export type BookingCheckoutSource = {
  startDate?: string;
  pickupDate?: string;
  checkoutCounter?: number | null;
};

export function bookingCheckoutOdometer(source: BookingCheckoutSource): number {
  return Math.max(0, Math.trunc(Number(source.checkoutCounter) || 0));
}

/** Checkout wall time: `pickupDate` when set, else `startDate`. */
export function bookingCheckoutTimeMs(source: BookingCheckoutSource): number | null {
  return resolveCheckoutMs(source.startDate, source.pickupDate);
}

export function parseLocalDateTimeInputMs(value: string): number | null {
  return parseFinishWallTimeMs(value);
}

/** Return odometer must be strictly greater than checkout odometer. */
export function isReturnOdometerAfterCheckout(returnOdom: number, checkoutOdom: number): boolean {
  if (!Number.isFinite(returnOdom)) {
    return false;
  }
  return Math.trunc(returnOdom) > Math.max(0, Math.trunc(checkoutOdom));
}

/** Return date/time must be strictly after checkout date/time. */
export function isReturnTimeAfterCheckout(returnMs: number, checkoutMs: number): boolean {
  return (
    Number.isFinite(returnMs) &&
    Number.isFinite(checkoutMs) &&
    returnMs > checkoutMs
  );
}
