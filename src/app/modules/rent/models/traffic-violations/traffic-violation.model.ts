/** Mirrors backend `TrafficViolationOrderingEnum` (int). Default 0 = typical first enum member. */
export type TrafficViolationOrderBy = number;

export interface TrafficViolation {
  id: string;
  nameViolation?: string;
  idBooking: number;
  idVehicle: number;
  /** Display helpers from nested `booking` / `vehicle` when API includes them. */
  bookingLabel?: string;
  vehiclePlate?: string;
  dateViolation: string;
  violationFine: number;
  description?: string;
  numberViolation: number;
  fleetId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrafficViolationFilters {
  fleetId?: string | null;
  pageNumber: number;
  pageSize: number;
  search?: string;
  orderBy?: TrafficViolationOrderBy;
  orderByDirection?: 'ASC' | 'DESC';
}

export interface TrafficViolationUpsertRequest {
  id?: string;
  nameViolation?: string;
  idBooking: number;
  idVehicle: number;
  dateViolation: string;
  violationFine: number;
  description?: string;
  numberViolation: number;
  fleetId: string;
}
