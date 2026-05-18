import { BookingStatus } from './booking.model';

/**
 * Mirrors `GetTrafficBookingsQueryResponse` (`GET Booking/List/traffic`).
 * Bookings eligible for linking a traffic violation (fleet + branch scoped).
 */
export interface TrafficBooking {
  id: number;
  idCustomer: number;
  idVehicle: number;
  idBranch: number;
  fleetId: string;
  status: BookingStatus | string;
  numberBookingINBasame?: string;
}
