import { bookingStatusFromCode } from './booking-status.utils';
import { TrafficBooking } from './traffic-booking.model';

function pickLoose(source: Record<string, unknown>, ...candidates: string[]): unknown {
  const keyByLower = new Map<string, string>();
  for (const k of Object.keys(source)) {
    keyByLower.set(k.toLowerCase(), k);
  }
  for (const wanted of candidates) {
    const actualKey = keyByLower.get(wanted.toLowerCase());
    if (actualKey !== undefined) {
      const value = source[actualKey];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }
  return undefined;
}

function toLong(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeTrafficBooking(raw: unknown): TrafficBooking {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const statusRaw = pickLoose(source, 'stutus', 'Stutus', 'status', 'Status');
  const status =
    statusRaw === undefined || statusRaw === null || statusRaw === ''
      ? 'Unknown'
      : bookingStatusFromCode(statusRaw);

  return {
    id: toLong(pickLoose(source, 'id', 'Id')),
    idCustomer: toLong(pickLoose(source, 'idCustomer', 'IdCustomer')),
    idVehicle: toLong(pickLoose(source, 'idVehicle', 'IdVehicle')),
    idBranch: toLong(pickLoose(source, 'idBranch', 'IdBranch')),
    fleetId: String(pickLoose(source, 'fleetId', 'FleetId') ?? '').trim(),
    status,
    numberBookingINBasame: String(
      pickLoose(source, 'numberBookingINBasame', 'NumberBookingINBasame') ?? '',
    ).trim() || undefined,
  };
}
