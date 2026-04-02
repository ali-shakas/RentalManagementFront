export type VehicleStatus = 'Available' | 'Booked' | 'Maintenance' | 'Inactive';
export type VehicleOrderBy = 'CreatedAt' | 'Year' | 'Plantnumber';
export type VehicleOrderDirection = 'ASC' | 'DESC';

export interface Vehicle {
  id: string;
  fleetId: string;
  fleetName?: string;
  branchId?: number | null;
  branchName?: string;
  categoryVehicleId?: string | null;
  idCategoryVehicle?: number | null;
  categoryName?: string;
  serialNumber?: string;
  engine?: string;
  yearMake?: number;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  color?: string;
  insuranceNumber?: string;
  insuranceType?: number | null;
  insuranceExpires?: string;
  licenseExpirationDate?: string;
  insurancePolicyNumber?: string;
  operatinCard?: string;
  validityCarRegistration?: string;
  countKm?: number | null;
  capacitOil?: number | null;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  createdAt?: string;
  status: VehicleStatus;
  isActive: boolean;
  imageUrl?: string | null;
  notes?: string;
}

export interface VehicleFilters {
  fleetId?: string;
  branchId?: number | null;
  status?: VehicleStatus | '';
  orderBy?: VehicleOrderBy;
  orderByDirection?: VehicleOrderDirection;
  search?: string;
  pageNumber: number;
  pageSize: number;
}

export interface VehicleUpsertRequest {
  id?: string;
  color?: string;
  insuranceNumber?: string;
  insuranceType?: number | null;
  insuranceExpires: string;
  licenseExpirationDate: string;
  insurancePolicyNumber: string;
  operatinCard: string;
  validityCarRegistration: string;
  fleetId: string;
  branchId: number;
  idCategoryVehicle: number;
  vin?: string;
  yearMake: number;
  engine?: string;
  serialNumber: string;
  plateNumber: string;
  countKm?: number | null;
  capacitOil?: number | null;
  status: VehicleStatus;
  isActive: boolean;
  notes?: string;
  image?: File | null;
}
