import { Booking } from './booking.model';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizeBooking(raw: unknown): Booking {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    fleetId: String(pick(source, 'fleetId', 'FleetId') ?? ''),
    branchId: pick<number>(source, 'branchId', 'BranchId', 'idBranch', 'IdBranch') ?? null,
    customerId: String(pick(source, 'customerId', 'CustomerId', 'idCustomer', 'IdCustomer', 'idCustomar', 'IdCustomar') ?? ''),
    vehicleId: String(pick(source, 'vehicleId', 'VehicleId', 'idVehicle', 'IdVehicle') ?? ''),
    startDate: String(pick(source, 'startDate', 'StartDate', 'createdAt', 'CreatedAt') ?? ''),
    endDate: String(pick(source, 'endDate', 'EndDate', 'updatedAt', 'UpdatedAt') ?? ''),
    totalAmount: pick<number>(source, 'totalAmount', 'TotalAmount', 'total', 'TOTAL'),
    paidAmount: pick<number>(source, 'paidAmount', 'PaidAmount', 'paid', 'Paid'),
    status: String(pick(source, 'status', 'Status', 'stutus', 'Stutusbooking') ?? 'Draft') as Booking['status'],
    notes: pick<string>(source, 'notes', 'Notes', 'dscription', 'Dscription'),
  };
}
