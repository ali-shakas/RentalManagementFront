import { Booking } from '../../models';
import { parseFinishWallTimeMs } from './booking-finish/booking-finish-billing.util';
import { resolveCheckoutMs } from './booking-close/booking-close-rules.util';

/** Checkout instant from contract (pickup date when set, else start date). */
export function bookingCheckoutMs(item: Booking): number | null {
  return resolveCheckoutMs(item.startDate, item.pickupDate);
}

export function bookingCheckoutOdometer(item: Booking): number {
  return Math.max(0, Math.trunc(Number(item.checkoutCounter) || 0));
}

/** Parsed return odometer; `null` when empty or not a finite integer. */
export function parseReturnOdometerInput(raw: string): number | null {
  const text = String(raw ?? '').trim();
  if (!text) {
    return null;
  }
  const n = Number(text);
  if (!Number.isFinite(n)) {
    return null;
  }
  return Math.trunc(n);
}

/** Return odometer must be strictly greater than checkout odometer. */
export function isReturnOdometerAboveCheckout(returnOdom: number, checkoutOdom: number): boolean {
  return returnOdom > checkoutOdom;
}

/**
 * `datetime-local` / ISO string as local wall time (same rules as finish/close screens).
 */
export function parseReturnDateTimeLocalMs(value: string): number | null {
  const text = String(value ?? '').trim();
  if (!text) {
    return null;
  }
  const fromFinish = parseFinishWallTimeMs(text);
  if (fromFinish !== null) {
    return fromFinish;
  }
  const ms = new Date(text).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** Return time must be strictly after checkout time. */
export function isReturnTimeAfterCheckout(returnMs: number, checkoutMs: number): boolean {
  return returnMs > checkoutMs;
}

export interface BookingReturnCheckoutValidation {
  checkoutMs: number | null;
  checkoutOdom: number;
  returnOdom: number | null;
  returnMs: number | null;
  odometerOk: boolean;
  timeOk: boolean;
}

export function validateReturnAgainstCheckout(
  item: Booking,
  returnOdometerRaw: string,
  returnDateTimeLocal: string,
): BookingReturnCheckoutValidation {
  const checkoutMs = bookingCheckoutMs(item);
  const checkoutOdom = bookingCheckoutOdometer(item);
  const returnOdom = parseReturnOdometerInput(returnOdometerRaw);
  const returnMs = parseReturnDateTimeLocalMs(returnDateTimeLocal);

  const odometerOk =
    returnOdom !== null && isReturnOdometerAboveCheckout(returnOdom, checkoutOdom);
  const timeOk =
    checkoutMs !== null && returnMs !== null && isReturnTimeAfterCheckout(returnMs, checkoutMs);

  return { checkoutMs, checkoutOdom, returnOdom, returnMs, odometerOk, timeOk };
}
