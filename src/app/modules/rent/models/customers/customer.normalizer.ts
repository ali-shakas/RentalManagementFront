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
  const nameAr = pick<string>(source, 'nameAr', 'NameAr');
  const nameEn = pick<string>(source, 'nameEn', 'NameEn');
  const firstMobileNumber = pick<string>(source, 'firstMobileNumber', 'FirstMobileNumber');
  const idNationality = pick<string>(source, 'idNationality', 'IdNationality');
  const licenceNo = pick<string>(source, 'licenceNo', 'LicenceNo');
  const birthDay = pick<string>(source, 'birthDay', 'BirthDay');
  const dateDrivinglicense = pick<string>(source, 'dateDrivinglicense', 'DateDrivinglicense');

  const rawImage = pick<string>(
    source,
    'imageUrl',
    'ImageUrl',
    'url',
    'Url',
    'URL',
    'image',
    'Image',
    'imagePath',
    'ImagePath',
    'fileName',
    'FileName',
  );
  const imageUrl =
    rawImage && !/[\\/]/.test(rawImage) && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(rawImage)
      ? `uploads/customer/${rawImage}`
      : rawImage;

  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    code: String(pick(source, 'numbercustomerINsystem', 'NumbercustomerINsystem') ?? ''),
    nameAr,
    nameEn,
    fullName: String(pick(source, 'fullName', 'FullName') ?? nameAr ?? nameEn ?? ''),
    firstMobileNumber,
    secondMobileNumber: pick<string>(source, 'secondMobileNumber', 'SecondMobileNumber'),
    thirdMobileNumber: pick<string>(source, 'thirdMobileNumber', 'ThirdMobileNumber'),
    email: pick<string>(source, 'email', 'Email'),
    phoneNumber: pick<string>(source, 'phoneNumber', 'PhoneNumber') ?? firstMobileNumber,
    idNationality,
    dateIdNationality: pick<string>(source, 'dateIdNationality', 'DateIdNationality'),
    birthDay,
    plaseIdNationality: pick<string>(source, 'plaseIdNationality', 'PlaseIdNationality'),
    plaseDrivinglicense: pick<string>(source, 'plaseDrivinglicense', 'PlaseDrivinglicense'),
    licenceNo,
    dateDrivinglicense,
    dateDrivinglicenseHajri: pick<string>(
      source,
      'dateDrivinglicenseHajri',
      'DateDrivinglicenseHajri',
    ),
    taxRecord: pick<number>(source, 'taxRecord', 'TaxRecord'),
    idSubscriptionsOfCustomer: pick<number>(
      source,
      'idSubscriptionsOfCustomer',
      'IdSubscriptionsOfCustomer',
    ),
    fleetId: pick<string>(source, 'fleetId', 'FleetId'),
    identityNumber: pick<string>(source, 'identityNumber', 'IdentityNumber') ?? idNationality,
    drivingLicenseNumber:
      pick<string>(source, 'drivingLicenseNumber', 'DrivingLicenseNumber') ?? licenceNo,
    drivingLicenseExpiryDate:
      pick<string>(source, 'drivingLicenseExpiryDate', 'DrivingLicenseExpiryDate') ??
      dateDrivinglicense,
    nationality: pick<string>(source, 'nationality', 'Nationality'),
    address: pick<string>(source, 'address', 'Address'),
    dateOfBirth: pick<string>(source, 'dateOfBirth', 'DateOfBirth') ?? birthDay,
    notes: pick<string>(source, 'notes', 'Notes'),
    isActive: Boolean(pick(source, 'isActive', 'IsActive') ?? true),
    imageUrl: imageUrl,
  };
}
