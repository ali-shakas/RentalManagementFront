export interface PaymentCount {
  id: string;
  /** Voucher / document number — string in `GetPaymentcountByIdBookingQueryResponse.PaymentNumber`, may be numeric in other DTOs. */
  paymentNumber?: string | number;
  /** مبلغ وقدره كنص قادم من الباك إند (MonyToText). */
  monyToText?: string;
  name?: string;
  description?: string;
  idCustomer?: number;
  customerName?: string;
  taxNumber?: string;
  urllogo?: string;
  idVehicle?: string | number;
  vehicleName?: string;
  plateNumber?: string;
  yearMake?: string | number;
  vehicleCategory?: string;
  idBranch?: number;
  branchName?: string;
  branchStreet?: string;
  branchNeighborHood?: string;
  branchBuldingNumber?: string;
  branchCity?: string;
  paid?: number;
  paymentType?: number;
  bondType?: number;
  status?: number;
  idCash?: string;
  idBank?: string;
  paidCash?: number;
  paidBank?: number;
  expenseCategory?: number;
  idBooking?: number;
  /** Booking workflow flag from payment-count DTO when present. */
  stutusbooking?: number;
  /** True when booking voucher was posted and must be edited from voucher page. */
  isPosting?: boolean;
  idFinancialYear?: string | number;
  createdAt?: string;
  details?: Array<Record<string, unknown>>;
}

export interface CreatePaymentCountRequest {
  idCustomer?: number;
  paid: number;
  dscription: string;
  idVehicle?: number;
  idBranch: number;
  paymentType: number;
  bondType: number;
  status: number;
  idCash?: string;
  idBank?: string;
  paidCash: number;
  paidBank: number;
  expenseCategory?: number;
  idBooking?: number;
  stutusbooking?: number;
  idFinancialYear?: string;
  fleetId: string;
  details?: PaymentCountDetailLineRequest[];
}

export interface PaymentCountDetailLineRequest {
  idCounting: string;
  price: number;
  node?: string;
  idBranch?: number;
  idFinancialYear?: string;
}

