import { Customer } from './customer.model';

function pick<T>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
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
