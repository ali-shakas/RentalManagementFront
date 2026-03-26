export interface Customer {
  id: string;
  code?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  identityNumber?: string;
  drivingLicenseNumber?: string;
  drivingLicenseExpiryDate?: string;
  nationality?: string;
  address?: string;
  dateOfBirth?: string;
  notes?: string;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface CustomerFilters {
  fleetId?: string;
  search?: string;
  isActive?: boolean | '';
  pageNumber: number;
  pageSize: number;
}

export interface CustomerUpsertRequest {
  id?: string;
  nameAr: string;
  nameEn?: string;
  firstMobileNumber: string;
  secondMobileNumber?: string;
  thirdMobileNumber?: string;
  address?: string;
  licenceNo: string;
  idNationality: string;
  dateIdNationality: string;
  birthDay?: string;
  plaseIdNationality?: string;
  plaseDrivinglicense?: string;
  nationality: string;
  dateDrivinglicense: string;
  dateDrivinglicenseHajri: string;
  taxRecord?: number;
  email?: string;
  idSubscriptionsOfCustomer: number;
  fleetId?: string;
  notes?: string;
  isActive: boolean;
  image?: File | null;
}
