import { Vehicle } from './vehicle.model';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizeVehicle(raw: unknown): Vehicle {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    fleetId: String(pick(source, 'fleetId', 'FleetId') ?? ''),
    branchId: pick<number>(source, 'branchId', 'BranchId') ?? null,
    categoryVehicleId: String(pick(source, 'categoryVehicleId', 'CategoryVehicleId', 'idCategoryVehicle', 'IdCategoryVehicle') ?? ''),
    categoryName: pick<string>(source, 'categoryName', 'CategoryName'),
    make: String(pick(source, 'make', 'Make', 'serialNumber', 'SerialNumber') ?? '-'),
    model: String(pick(source, 'model', 'Model', 'engine', 'Engine') ?? '-'),
    year: Number(pick(source, 'year', 'Year', 'yearMake', 'YearMake') ?? 0),
    plateNumber: String(pick(source, 'plateNumber', 'PlateNumber') ?? ''),
    vin: pick<string>(source, 'vin', 'VIN'),
    color: pick<string>(source, 'color', 'Color'),
    mileage: pick<number>(source, 'mileage', 'Mileage', 'countKm', 'CountKm'),
    transmission: pick<string>(source, 'transmission', 'Transmission'),
    fuelType: pick<string>(source, 'fuelType', 'FuelType'),
    seats: pick<number>(source, 'seats', 'Seats', 'capacitOil', 'CapacitOil'),
    status: String(pick(source, 'status', 'Status') ?? 'Available') as Vehicle['status'],
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? true),
    imageUrl: pick<string>(source, 'imageUrl', 'ImageUrl', 'url', 'Url'),
    notes: pick<string>(source, 'notes', 'Notes'),
  };
}
