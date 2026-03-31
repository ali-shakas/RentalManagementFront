export type BookingStatus = 'Draft' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  bookingNumber?: string;
  fleetId: string;
  fleetName?: string;
  branchId?: number | null;
  branchName?: string;
  customerId: string;
  customerName?: string;
  vehicleId: string;
  vehicleName?: string;
  vehiclePlateNumber?: string;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  returnDate?: string;
  totalAmount?: number;
  depositAmount?: number;
  paidAmount?: number;
  status: BookingStatus;
  notes?: string;
}

export interface BookingFilters {
  fleetId?: string;
  branchId?: number | null;
  status?: BookingStatus | '';
  startDate?: string;
  endDate?: string;
  search?: string;
  orderByDirection?: string;
  orderBy?: string;
  pageNumber: number;
  pageSize: number;
}

export interface BookingUpsertRequest {
  id?: string;
  idVehicle: number;
  idCustomer: number;
  idBranch: number;
  fleetId: string;
  distancetraveledgps?: string;
  numberOfHoursExcess: number;
  numberKmExcess: number;
  dayExcess: number;
  discount: number;
  checkoutCounter: number;
  checkinCounter: number;
  countOfDay: number;
  priceInDay: number;
  priceInMonth: number;
  allowTo: number;
  countKMExtra: number;
  priceHoureExtra: number;
  priceKmExtra: number;
  otherExpenses: number;
  total: number;
  startDate: string;
  endDate: string;
  dateReturnVehical: string;
  note?: string;
  placeUSE?: string;
  totalTrafic: number;
  totalMaintance: number;
  totalReceivedVehicle: number;
  transportationFees: number;
  totaltax: number;
  numberBookingINBasame?: string;
}
