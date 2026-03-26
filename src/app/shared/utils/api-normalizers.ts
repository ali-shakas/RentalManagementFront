import {
  Booking,
  Branch,
  CategoryVehicle,
  Customer,
  Fleet,
  PaginatedResponse,
  PrivilegeTypeLookup,
  RoleLookup,
  User,
  Vehicle,
} from '../models';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizePaginatedResponse<T>(
  raw: unknown,
  mapItem: (item: unknown) => T = item => item as T,
): PaginatedResponse<T> {
  const source = (raw ?? {}) as Record<string, unknown>;
  const itemsRaw = (pick<unknown[]>(source, 'items', 'Items') ?? []) as unknown[];

  return {
    items: itemsRaw.map(mapItem),
    totalCount: Number(pick(source, 'totalCount', 'TotalCount') ?? itemsRaw.length),
    pageNumber: Number(pick(source, 'pageNumber', 'PageNumber') ?? 1),
    pageSize: Number(pick(source, 'pageSize', 'PageSize') ?? itemsRaw.length),
    totalPages: Number(pick(source, 'totalPages', 'TotalPages') ?? 1),
  };
}

export function normalizeUser(raw: unknown): User {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    userName: String(pick(source, 'userName', 'UserName') ?? ''),
    email: String(pick(source, 'email', 'Email') ?? ''),
    password: pick<string>(source, 'password', 'Password'),
    nameAr: pick<string>(source, 'nameAr', 'NameAr'),
    nameEn: pick<string>(source, 'nameEn', 'NameEn'),
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? false),
    isAdmin: pick<boolean>(source, 'isAdmin', 'IsAdmin'),
    expirationDate: pick<string>(source, 'expirationDate', 'ExpirationDate'),
    appId: pick<string>(source, 'appId', 'AppId'),
    companyId: pick<string>(source, 'companyId', 'CompanyId'),
    connectionId: pick<string>(source, 'connectionId', 'ConnectionId'),
    connected: pick<boolean>(source, 'connected', 'Connected'),
    connectionDate: pick<string>(source, 'connectionDate', 'ConnectionDate'),
    disconnectionDate: pick<string>(source, 'disconnectionDate', 'DisconnectionDate'),
    currentViewingPageUrl: pick<string>(source, 'currentViewingPageUrl', 'CurrentViewingPageUrl'),
    enableAlert: pick<boolean>(source, 'enableAlert', 'EnableAlert'),
    enableMobileAlerts: pick<boolean>(source, 'enableMobileAlerts', 'EnableMobileAlerts'),
    branchId: pick<number>(source, 'branchId', 'BranchId'),
    branchNameAr: pick<string>(source, 'branchNameAr', 'BranchNameAr'),
    branchNameEn: pick<string>(source, 'branchNameEn', 'BranchNameEn'),
    userRoles: pick(source, 'userRoles', 'UserRoles'),
    userPrivileges: pick(source, 'userPrivileges', 'UserPrivileges'),
  };
}

export function normalizeFleet(raw: unknown): Fleet {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    name: String(pick(source, 'name', 'Name') ?? ''),
    description: pick<string>(source, 'description', 'Description'),
    fleetCode: pick<string>(source, 'fleetCode', 'FleetCode'),
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? false),
    location: pick<string>(source, 'location', 'Location'),
    contactNumber: pick<string>(source, 'contactNumber', 'ContactNumber'),
    email: pick<string>(source, 'email', 'Email'),
    createdBy: pick<string>(source, 'createdBy', 'CreatedBy'),
    updatedBy: pick<string>(source, 'updatedBy', 'UpdatedBy'),
    createdAt: pick<string>(source, 'createdAt', 'CreatedAt'),
    updatedAt: pick<string>(source, 'updatedAt', 'UpdatedAt'),
    deletedBy: pick<string>(source, 'deletedBy', 'DeletedBy'),
    deletedAt: pick<string>(source, 'deletedAt', 'DeletedAt'),
    isDeleted: pick<boolean>(source, 'isDeleted', 'IsDeleted'),
  };
}

export function normalizeBranch(raw: unknown): Branch {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(pick(source, 'id', 'Id') ?? 0),
    fleetId: String(pick(source, 'fleetId', 'FleetId') ?? ''),
    nameAr: String(pick(source, 'nameAr', 'NameAr') ?? ''),
    nameEn: pick<string>(source, 'nameEn', 'NameEn'),
    code: pick<string>(source, 'code', 'Code'),
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? false),
    createdBy: pick<string>(source, 'createdBy', 'CreatedBy'),
    updatedBy: pick<string>(source, 'updatedBy', 'UpdatedBy'),
    createdAt: pick<string>(source, 'createdAt', 'CreatedAt'),
    updatedAt: pick<string>(source, 'updatedAt', 'UpdatedAt'),
    deletedBy: pick<string>(source, 'deletedBy', 'DeletedBy'),
    deletedAt: pick<string>(source, 'deletedAt', 'DeletedAt'),
    isDeleted: pick<boolean>(source, 'isDeleted', 'IsDeleted'),
  };
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

export function normalizeCustomer(raw: unknown): Customer {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    code: String(pick(source, 'numbercustomerINsystem', 'NumbercustomerINsystem') ?? ''),
    fullName: String(
      pick(source, 'fullName', 'FullName', 'nameAr', 'NameAr', 'nameEn', 'NameEn') ?? '',
    ),
    email: pick<string>(source, 'email', 'Email'),
    phoneNumber: pick<string>(source, 'phoneNumber', 'PhoneNumber', 'firstMobileNumber', 'FirstMobileNumber'),
    identityNumber: pick<string>(source, 'identityNumber', 'IdentityNumber', 'idNationality', 'IdNationality'),
    drivingLicenseNumber: pick<string>(source, 'drivingLicenseNumber', 'DrivingLicenseNumber', 'licenceNo', 'LicenceNo'),
    drivingLicenseExpiryDate: pick<string>(source, 'drivingLicenseExpiryDate', 'DrivingLicenseExpiryDate', 'dateDrivinglicense', 'DateDrivinglicense'),
    nationality: pick<string>(source, 'nationality', 'Nationality'),
    address: pick<string>(source, 'address', 'Address'),
    dateOfBirth: pick<string>(source, 'dateOfBirth', 'DateOfBirth', 'birthDay', 'BirthDay'),
    notes: pick<string>(source, 'notes', 'Notes'),
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? true),
    imageUrl: pick<string>(source, 'imageUrl', 'ImageUrl', 'url', 'Url'),
  };
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

export function normalizeCategoryVehicle(raw: unknown): CategoryVehicle {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    fleetId: String(pick(source, 'fleetId', 'FleetId') ?? ''),
    nameAr: String(pick(source, 'nameAr', 'NameAr') ?? ''),
    nameEn: pick<string>(source, 'nameEn', 'NameEn'),
    code: pick<string>(source, 'code', 'Code'),
    description: pick<string>(source, 'description', 'Description'),
    imageUrl: pick<string>(source, 'imageUrl', 'ImageUrl', 'url', 'Url'),
    isActive: !Boolean(pick(source, 'isDeleted', 'IsDeleted') ?? false),
    price_day_low: pick<number>(source, 'price_day_low', 'Price_day_low'),
    price_day_high: pick<number>(source, 'price_day_high', 'Price_day_high'),
    price_month_low: pick<number>(source, 'price_month_low', 'Price_month_low'),
    price_month_high: pick<number>(source, 'price_month_high', 'Price_month_high'),
    priceHoureExtraLow: pick<number>(source, 'priceHoureExtraLow', 'PriceHoureExtraLow'),
    priceHoureExtraHigh: pick<number>(source, 'priceHoureExtraHigh', 'PriceHoureExtraHigh'),
    countKMExtraLow: pick<number>(source, 'countKMExtraLow', 'CountKMExtraLow'),
    countKMExtraHigh: pick<number>(source, 'countKMExtraHigh', 'CountKMExtraHigh'),
    allowToLow: pick<number>(source, 'allowToLow', 'AllowToLow'),
    allowToHigh: pick<number>(source, 'allowToHigh', 'AllowToHigh'),
  };
}

export function normalizeRole(raw: unknown): RoleLookup {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    name: String(pick(source, 'name', 'Name') ?? ''),
    displayName: String(pick(source, 'displayName', 'DisplayName') ?? ''),
    displayNameEn: String(pick(source, 'displayNameEn', 'DisplayNameEn') ?? ''),
    companyId: pick<string>(source, 'companyId', 'CompanyId'),
    privilegeTypeRoles: pick(source, 'privilegeTypeRoles', 'PrivilegeTypeRoles'),
  };
}

export function normalizePrivilege(raw: unknown): PrivilegeTypeLookup {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    name: String(pick(source, 'name', 'Name') ?? ''),
    nameEn: String(pick(source, 'nameEn', 'NameEn') ?? ''),
    privilegeName: String(pick(source, 'privilegeName', 'PrivilegeName') ?? ''),
    order: pick<number>(source, 'order', 'Order'),
    editable: pick<boolean>(source, 'editable', 'Editable'),
    companyId: pick<string>(source, 'companyId', 'CompanyId'),
  };
}
