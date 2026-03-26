export type VehicleStatus = 'Available' | 'Booked' | 'Maintenance' | 'Inactive';

export interface Vehicle {
  id: string;
  fleetId: string;
  fleetName?: string;
  branchId?: number | null;
  branchName?: string;
  categoryVehicleId?: string | null;
  categoryName?: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  color?: string;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  mileage?: number;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  status: VehicleStatus;
  isActive: boolean;
  imageUrl?: string | null;
  notes?: string;
}

export interface VehicleFilters {
  fleetId?: string;
  branchId?: number | null;
  status?: VehicleStatus | '';
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
