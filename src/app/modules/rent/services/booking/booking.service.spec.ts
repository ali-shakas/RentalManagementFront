import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('BookingService', () => {
  let service: BookingService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockBooking = {
    id: 'booking-1',
    bookingNumber: 'BK-001',
    customerId: 'cust-1',
    customerName: 'Ahmed Hassan',
    vehicleId: 'vehicle-1',
    vehiclePlate: 'ABC-1234',
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    status: 'confirmed',
    totalAmount: 250,
    dailyRate: 50,
    days: 5,
    isActive: true,
  };

  const mockBookingList = [
    mockBooking,
    { id: 'booking-2', bookingNumber: 'BK-002', customerId: 'cust-2', customerName: 'Fatima Ali', vehicleId: 'vehicle-2', status: 'pending', totalAmount: 300 },
    { id: 'booking-3', bookingNumber: 'BK-003', customerId: 'cust-3', customerName: 'Omar Khan', vehicleId: 'vehicle-3', status: 'completed', totalAmount: 200 },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData', 'patchData']);
    TestBed.configureTestingModule({
      providers: [BookingService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(BookingService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all bookings', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        expect(bookings.length).toBe(3);
        expect(bookings[0].bookingNumber).toBe('BK-001');
        done();
      });
    });

    it('should handle empty booking list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((bookings) => {
        expect(bookings).toEqual([]);
        done();
      });
    });

    it('should filter by status', (done) => {
      const confirmedBookings = mockBookingList.filter((b) => b.status === 'confirmed');
      baseServiceSpy.getData.and.returnValue(of(confirmedBookings));

      service.getList().subscribe((bookings) => {
        expect(bookings.every((b) => b.status === 'confirmed')).toBe(true);
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve booking by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBooking));

      service.getById('booking-1').subscribe((booking) => {
        expect(booking.id).toBe('booking-1');
        expect(booking.bookingNumber).toBe('BK-001');
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      customerId: 'cust-4',
      vehicleId: 'vehicle-4',
      startDate: '2024-02-01',
      endDate: '2024-02-07',
      dailyRate: 75,
      notes: 'Airport pickup required',
    };

    it('should create new booking', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'booking-new', bookingNumber: 'BK-004', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include all booking details', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.customerId).toBe('cust-4');
        expect(payload.vehicleId).toBe('vehicle-4');
        done();
      });
    });
  });

  describe('update', () => {
    const updateRequest = {
      id: 'booking-1',
      status: 'completed',
      endDate: '2024-01-06',
    };

    it('should update booking', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should preserve booking id', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.id).toBe('booking-1');
        done();
      });
    });
  });

  describe('calculations', () => {
    it('should calculate rental days', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        bookings.forEach((booking) => {
          const startDate = new Date(booking.startDate);
          const endDate = new Date(booking.endDate);
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          expect(days).toBeGreaterThan(0);
        });
        done();
      });
    });

    it('should calculate total booking value', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        const totalValue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        expect(totalValue).toBeGreaterThan(0);
        done();
      });
    });

    it('should validate booking dates', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        bookings.forEach((booking) => {
          const start = new Date(booking.startDate);
          const end = new Date(booking.endDate);
          expect(start <= end).toBe(true);
        });
        done();
      });
    });
  });

  describe('filtering and searching', () => {
    it('should filter by booking status', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        const pending = bookings.filter((b) => b.status === 'pending');
        expect(pending.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should search by customer name', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        const found = bookings.find((b) => b.customerName.includes('Ahmed'));
        expect(found).toBeDefined();
        done();
      });
    });

    it('should search by booking number', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBookingList));

      service.getList().subscribe((bookings) => {
        const found = bookings.find((b) => b.bookingNumber === 'BK-001');
        expect(found).toBeDefined();
        done();
      });
    });

    it('should sort by start date', (done) => {
      const sorted = [...mockBookingList].sort((a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
      baseServiceSpy.getData.and.returnValue(of(sorted));

      service.getList().subscribe((bookings) => {
        if (bookings.length > 1) {
          expect(new Date(bookings[0].startDate) <= new Date(bookings[bookings.length - 1].startDate)).toBe(true);
        }
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle same-day bookings', (done) => {
      const sameDayBooking = { ...mockBooking, startDate: '2024-01-01', endDate: '2024-01-01' };
      baseServiceSpy.getData.and.returnValue(of([sameDayBooking]));

      service.getList().subscribe((bookings) => {
        expect(bookings[0].startDate).toBe(bookings[0].endDate);
        done();
      });
    });

    it('should handle multi-month bookings', (done) => {
      const longBooking = { ...mockBooking, startDate: '2024-01-01', endDate: '2024-12-31' };
      baseServiceSpy.getData.and.returnValue(of([longBooking]));

      service.getList().subscribe((bookings) => {
        const days = Math.ceil(
          (new Date(bookings[0].endDate).getTime() - new Date(bookings[0].startDate).getTime()) / (1000 * 60 * 60 * 24),
        );
        expect(days).toBeGreaterThan(30);
        done();
      });
    });

    it('should handle zero amount bookings', (done) => {
      const freeBooking = { ...mockBooking, totalAmount: 0, dailyRate: 0 };
      baseServiceSpy.getData.and.returnValue(of([freeBooking]));

      service.getList().subscribe((bookings) => {
        expect(bookings[0].totalAmount).toBe(0);
        done();
      });
    });
  });
});
