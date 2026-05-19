import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CreateFinancialYearRequest } from '../../models/financial-years/financial-year.model';
import { FinancialYearService } from '../financial-years/financial-year.service';

describe('FinancialYearService', () => {
  let service: FinancialYearService;
  let httpMock: HttpTestingController;

  const apiBase = '/Api/V1/CarRentalManagament';
  const fleetId = '11111111-0000-0000-0000-000000000001';
  const financialYearId = '77777777-0000-0000-0000-000000000401';

  const apiFinancialYear = {
    Id: financialYearId,
    FinancialYearNumber: 2026,
    Name: 'FY 2026',
    StartDate: '2026-01-01',
    EndDate: '2026-12-31',
    IsCurrentYear: true,
  };

  const createPayload: CreateFinancialYearRequest & Record<string, unknown> = {
    financialYearNumber: 2026,
    name: 'FY 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isCurrentYear: true,
    fleetId,
    idFleet: fleetId,
    status: 'Active',
    idBranch: 12,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FinancialYearService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FinancialYearService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets all financial years and sends fleet query params correctly', () => {
    service.getList(fleetId).subscribe(years => {
      expect(years).toEqual([
        jasmine.objectContaining({
          id: financialYearId,
          financialYearNumber: 2026,
          name: 'FY 2026',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          isCurrentYear: true,
        }),
      ]);
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/FinancialYear/List` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('IdFleet') === fleetId &&
      request.params.get('Fleetid') === null,
    );

    req.flush({ data: [apiFinancialYear], succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('gets an empty financial year list when the API returns null data', () => {
    service.getList(fleetId).subscribe(years => {
      expect(years).toEqual([]);
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' && request.url === `${apiBase}/FinancialYear/List`,
    );

    req.flush({ data: null, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a financial year using the actual FinancialYear endpoint and preserves core body fields', () => {
    service.create(createPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
    });

    const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      financialYearNumber: 2026,
      name: 'FY 2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isCurrentYear: true,
      fleetId,
      idFleet: fleetId,
      status: 'Active',
      idBranch: 12,
    }));
    req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('passes through a valid date range where startDate is before endDate', () => {
    service.create({
      ...createPayload,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
    });

    const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
    expect(req.request.body.startDate).toBe('2026-01-01');
    expect(req.request.body.endDate).toBe('2026-12-31');
    req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('passes through equal startDate and endDate when the caller provides them', () => {
    service.create({
      ...createPayload,
      startDate: '2026-01-01',
      endDate: '2026-01-01',
    }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
    });

    const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
    expect(req.request.body.startDate).toBe('2026-01-01');
    expect(req.request.body.endDate).toBe('2026-01-01');
    req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('passes through endDate before startDate because the service does not validate date ordering', () => {
    service.create({
      ...createPayload,
      startDate: '2026-12-31',
      endDate: '2026-01-01',
    }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
    });

    const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
    expect(req.request.body.startDate).toBe('2026-12-31');
    expect(req.request.body.endDate).toBe('2026-01-01');
    req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('passes through leap-year dates without changing them', () => {
    service.create({
      ...createPayload,
      financialYearNumber: 2024,
      name: 'FY 2024 Leap',
      startDate: '2024-02-28',
      endDate: '2024-02-29',
    }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
    });

    const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
    expect(req.request.body.financialYearNumber).toBe(2024);
    expect(req.request.body.startDate).toBe('2024-02-28');
    expect(req.request.body.endDate).toBe('2024-02-29');
    req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('passes through year boundary dates 01/01 and 31/12', () => {
    service.create({
      ...createPayload,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
    });

    const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
    expect(req.request.body.startDate).toBe('2026-01-01');
    expect(req.request.body.endDate).toBe('2026-12-31');
    req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('passes through active, closed, and draft status values when included by the caller', () => {
    const statuses = ['Active', 'Closed', 'Draft'];

    statuses.forEach(status => {
      const payload: CreateFinancialYearRequest & Record<string, unknown> = {
        ...createPayload,
        status,
      };

      service.create(payload).subscribe(response => {
        expect(response).toEqual(jasmine.objectContaining({ id: financialYearId }));
      });

      const req = httpMock.expectOne(`${apiBase}/FinancialYear`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.status).toBe(status);
      req.flush({ data: { id: financialYearId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
    });
  });

  it('propagates API errors to the subscriber', () => {
    service.getList(fleetId).subscribe({
      next: () => fail('Expected getList to fail'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.error.errors).toEqual(['FinancialYear API failure']);
      },
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' && request.url === `${apiBase}/FinancialYear/List`,
    );

    req.flush(
      { data: null, succeeded: false, errors: ['FinancialYear API failure'], propertyErrors: {}, httpStatusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );
  });
});
