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
  const serialNumber = pick<string>(source, 'serialNumber', 'SerialNumber');
  const engine = pick<string>(source, 'engine', 'Engine');
  const yearMake = pick<number>(source, 'yearMake', 'YearMake');
  const idCategoryVehicle = pick<number>(source, 'idCategoryVehicle', 'IdCategoryVehicle');

  const rawImage = pick<string>(source, 'imageUrl', 'ImageUrl', 'url', 'Url');
  const imageUrl =
    rawImage && !/[\\/]/.test(rawImage) && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(rawImage)
      ? `uploads/vehicle/${rawImage}`
      : rawImage;

  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    fleetId: String(pick(source, 'fleetId', 'FleetId') ?? ''),
    branchId: pick<number>(source, 'branchId', 'BranchId') ?? null,
    branchName:
      pick<string>(source, 'branchName', 'BranchName') ??
      pick<string>(source, 'branchNameAr', 'BranchNameAr') ??
      pick<string>(source, 'branchNameEn', 'BranchNameEn'),
    categoryVehicleId: String(pick(source, 'categoryVehicleId', 'CategoryVehicleId', 'idCategoryVehicle', 'IdCategoryVehicle') ?? ''),
    idCategoryVehicle: idCategoryVehicle ?? null,
    categoryName: pick<string>(source, 'categoryName', 'CategoryName'),
    serialNumber: serialNumber,
    engine: engine,
    yearMake: yearMake,
    make: String(pick(source, 'make', 'Make') ?? serialNumber ?? '-'),
    model: String(pick(source, 'model', 'Model') ?? engine ?? '-'),
    year: Number(pick(source, 'year', 'Year') ?? yearMake ?? 0),
    plateNumber: String(pick(source, 'plateNumber', 'PlateNumber') ?? ''),
    vin: pick<string>(source, 'vin', 'VIN'),
    color: pick<string>(source, 'color', 'Color'),
    insuranceNumber: pick<string>(source, 'insuranceNumber', 'InsuranceNumber'),
    insuranceType: pick<number>(source, 'insuranceType', 'InsuranceType') ?? null,
    insuranceExpires: pick<string>(source, 'insuranceExpires', 'InsuranceExpires'),
    licenseExpirationDate: pick<string>(source, 'licenseExpirationDate', 'LicenseExpirationDate'),
    insurancePolicyNumber: pick<string>(source, 'insurancePolicyNumber', 'InsurancePolicyNumber'),
    operatinCard: pick<string>(source, 'operatinCard', 'OperatinCard'),
    validityCarRegistration: pick<string>(source, 'validityCarRegistration', 'ValidityCarRegistration'),
    countKm: pick<number>(source, 'countKm', 'CountKm') ?? null,
    capacitOil: pick<number>(source, 'capacitOil', 'CapacitOil') ?? null,
    mileage: pick<number>(source, 'mileage', 'Mileage', 'countKm', 'CountKm'),
    transmission: pick<string>(source, 'transmission', 'Transmission'),
    fuelType: pick<string>(source, 'fuelType', 'FuelType'),
    seats: pick<number>(source, 'seats', 'Seats', 'capacitOil', 'CapacitOil'),
    createdAt: pick<string>(source, 'createdAt', 'CreatedAt'),
    status: String(pick(source, 'status', 'Status') ?? 'Available') as Vehicle['status'],
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? true),
    imageUrl: imageUrl,
    notes: pick<string>(source, 'notes', 'Notes'),
  };
}
