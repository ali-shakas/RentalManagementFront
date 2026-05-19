import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CreatePaymentCountRequest } from '../../models/payment-counts/payment-count.model';
import { PaymentCountService } from '../payment-counts/payment-count.service';

describe('PaymentCountService', () => {
  let service: PaymentCountService;
  let httpMock: HttpTestingController;

  const apiBase = '/Api/V1/CarRentalManagament';
  const fleetId = '11111111-0000-0000-0000-000000000001';
  const paymentCountId = '22222222-0000-0000-0000-000000000501';
  const financialYearId = '77777777-0000-0000-0000-000000000401';
  const cashId = '99999999-0000-0000-0000-000000001101';
  const bankId = '99999999-0000-0000-0000-000000001102';
  const countingRevenueId = '99999999-0000-0000-0000-000000004101';

  const apiPaymentCount = {
    Id: paymentCountId,
    PaymentNumber: 'RC-1001',
    Paid: 250,
    PaymentType: 1,
    BondType: 1,
    Status: 1,
    IdCash: cashId,
    PaidCash: 250,
    PaidBank: 0,
    IdBranch: 12,
    IdBooking: 44,
    Stutusbooking: 2,
    IdFinancialYear: financialYearId,
    Dscription: 'Receipt voucher',
    Details: [
      {
        IdCounting: countingRevenueId,
        Price: 250,
        Node: 'Daily rental revenue',
      },
    ],
  };

  const receiptPayload: CreatePaymentCountRequest = {
    paid: 250,
    dscription: 'Receipt voucher',
    idBranch: 12,
    paymentType: 1,
    bondType: 1,
    status: 1,
    idCash: cashId,
    paidCash: 250,
    paidBank: 0,
    idBooking: 44,
    stutusbooking: 2,
    idFinancialYear: financialYearId,
    fleetId,
    details: [
      {
        idCounting: countingRevenueId,
        price: 250,
        node: 'Daily rental revenue',
        idBranch: 12,
        idFinancialYear: financialYearId,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentCountService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PaymentCountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets all payment counts and sends fleet and branch query params correctly', () => {
    service.getList(fleetId, '12').subscribe(items => {
      expect(items).toEqual([
        jasmine.objectContaining({
          id: paymentCountId,
          paid: 250,
          bondType: 1,
          idBooking: 44,
        }),
      ]);
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/Paymentcount/List` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('IdFleet') === fleetId &&
      request.params.get('Fleetid') === null &&
      request.params.get('BranchId') === '12',
    );

    req.flush({ data: [apiPaymentCount], succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('gets paginated payment counts with filters, branch, bond type, payment type, and ordering params', () => {
    service
      .getPaginated({
        fleetId: ` ${fleetId} `,
        branchId: 12,
        status: 1,
        bondTypePaymentcount: 1,
        paymentTypePaymentcount: 2,
        pageNumber: 3,
        pageSize: 20,
        search: ' booking ',
        orderBy: 'Paid',
        orderByDirection: 'ASC',
      })
      .subscribe(response => {
        expect(response.items).toEqual([
          jasmine.objectContaining({ id: paymentCountId, paid: 250 }),
        ]);
        expect(response.totalCount).toBe(1);
      });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/Paymentcount/Paginated` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('IdFleet') === fleetId &&
      request.params.get('BRANCHID') === '12' &&
      request.params.get('BranchId') === null &&
      request.params.get('Status') === '1' &&
      request.params.get('status') === null &&
      request.params.get('BondTypePaymentcount') === '1' &&
      request.params.get('BondType') === '1' &&
      request.params.get('PaymentTypePaymentcount') === '2' &&
      request.params.get('PaymentType') === '2' &&
      request.params.get('PageNumber') === '3' &&
      request.params.get('PageSize') === '20' &&
      request.params.get('Search') === 'booking' &&
      request.params.get('OrderBy') === 'Paid' &&
      request.params.get('OrderByDirection') === 'ASC',
    );

    req.flush({
      data: { items: [apiPaymentCount], pageNumber: 3, pageSize: 20, totalCount: 1, totalPages: 1 },
      succeeded: true,
      errors: [],
      propertyErrors: {},
      httpStatusCode: 200,
    });
  });

  it('gets payment count by id using the actual backend URL shape', () => {
    service.getById(paymentCountId, fleetId).subscribe(item => {
      expect(item).toEqual(jasmine.objectContaining({
        id: paymentCountId,
        paymentNumber: 'RC-1001',
        paid: 250,
      }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount/${paymentCountId}/${fleetId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: apiPaymentCount, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('gets payment counts by booking id using the booking URL shape', () => {
    service.getByBookingId(44, fleetId).subscribe(items => {
      expect(items).toEqual([
        jasmine.objectContaining({
          id: paymentCountId,
          idBooking: 44,
        }),
      ]);
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount/44/${fleetId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [apiPaymentCount], succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('does not call the API for invalid booking id or missing fleet id', () => {
    service.getByBookingId(0, fleetId).subscribe(items => {
      expect(items).toEqual([]);
    });

    service.getByBookingId(44, ' ').subscribe(items => {
      expect(items).toEqual([]);
    });
  });

  it('creates a receipt voucher and maps financial body fields correctly', () => {
    service.create(receiptPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: paymentCountId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      paid: 250,
      Paid: 250,
      dscription: 'Receipt voucher',
      Dscription: 'Receipt voucher',
      paymentType: 1,
      PaymentType: 1,
      bondType: 1,
      BondType: 1,
      idBranch: 12,
      IdBranch: 12,
      idCash: cashId,
      IdCash: cashId,
      paidCash: 250,
      PaidCash: 250,
      paidBank: 0,
      PaidBank: 0,
      idBooking: 44,
      IdBooking: 44,
      fleetId,
      FleetId: fleetId,
    }));
    req.flush({ data: { id: paymentCountId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a payment voucher and maps bank/payment fields correctly', () => {
    const paymentPayload: CreatePaymentCountRequest = {
      ...receiptPayload,
      paid: 180,
      dscription: 'Payment voucher',
      paymentType: 2,
      bondType: 2,
      idCash: undefined,
      idBank: bankId,
      paidCash: 0,
      paidBank: 180,
      expenseCategory: 3,
      idBooking: undefined,
      stutusbooking: undefined,
      details: [],
    };

    service.create(paymentPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: paymentCountId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      paid: 180,
      Paid: 180,
      dscription: 'Payment voucher',
      bondType: 2,
      BondType: 2,
      paymentType: 2,
      PaymentType: 2,
      idBank: bankId,
      IdBank: bankId,
      paidBank: 180,
      PaidBank: 180,
      paidCash: 0,
      PaidCash: 0,
      expenseCategory: 3,
      ExpenseCategory: 3,
    }));
    req.flush({ data: { id: paymentCountId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a booking-linked voucher and sends booking status fields correctly', () => {
    service.create({ ...receiptPayload, idBooking: 77, stutusbooking: 4 }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: paymentCountId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      idBooking: 77,
      IdBooking: 77,
      stutusbooking: 4,
      Stutusbooking: 4,
      statusBooking: 4,
      StatusBooking: 4,
    }));
    req.flush({ data: { id: paymentCountId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates voucher detail lines with counting id, amount, note, branch, financial year, and line order', () => {
    service.create(receiptPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: paymentCountId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.details).toEqual([
      jasmine.objectContaining({
        idCounting: countingRevenueId,
        IdCounting: countingRevenueId,
        countingId: countingRevenueId,
        CountingId: countingRevenueId,
        price: 250,
        Price: 250,
        node: 'Daily rental revenue',
        Node: 'Daily rental revenue',
        idBranch: 12,
        IdBranch: 12,
        idFinancialYear: financialYearId,
        IdFinancialYear: financialYearId,
        lineOrder: 1,
        LineOrder: 1,
      }),
    ]);
    expect(req.request.body.Details).toEqual(req.request.body.details);
    expect(req.request.body.paymentCountDetails).toEqual(req.request.body.details);
    req.flush({ data: { id: paymentCountId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a voucher with empty details when details is an empty array', () => {
    service.create({ ...receiptPayload, paid: 0, paidCash: 0, details: [] }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: paymentCountId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.paid).toBe(0);
    expect(req.request.body.paidCash).toBe(0);
    expect(req.request.body.details).toEqual([]);
    expect(req.request.body.Details).toEqual([]);
    req.flush({ data: { id: paymentCountId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('keeps null optional fields and missing booking id as-is when the service allows them', () => {
    const payload: CreatePaymentCountRequest = {
      paid: 0,
      dscription: 'No optional fields',
      idBranch: 12,
      paymentType: 1,
      bondType: 1,
      status: 1,
      idCash: undefined,
      idBank: undefined,
      paidCash: 0,
      paidBank: 0,
      idBooking: undefined,
      stutusbooking: undefined,
      fleetId,
    };

    service.create(payload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: paymentCountId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Paymentcount`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      paid: 0,
      Paid: 0,
      idCash: undefined,
      IdCash: undefined,
      idBank: undefined,
      IdBank: undefined,
      idBooking: undefined,
      IdBooking: undefined,
      details: undefined,
      Details: undefined,
    }));
    req.flush({ data: { id: paymentCountId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('propagates API errors to the subscriber', () => {
    service.getList(fleetId).subscribe({
      next: () => fail('Expected getList to fail'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.error.errors).toEqual(['PaymentCount API failure']);
      },
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' && request.url === `${apiBase}/Paymentcount/List`,
    );

    req.flush(
      { data: null, succeeded: false, errors: ['PaymentCount API failure'], propertyErrors: {}, httpStatusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );
  });

  it('falls back through booking posting status URL candidates when earlier routes fail', () => {
    service.getLastIsPostingForBooking(44, fleetId).subscribe(isPosting => {
      expect(isPosting).toBeTrue();
    });

    httpMock
      .expectOne(`${apiBase}/Paymentcount/isposted/44/${fleetId}`)
      .flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });

    const fallbackReq = httpMock.expectOne(`${apiBase}/Paymentcount/lastbyidbookingisposting/44/${fleetId}`);
    expect(fallbackReq.request.method).toBe('GET');
    fallbackReq.flush({ data: true, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });
});
