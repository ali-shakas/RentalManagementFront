import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CountingEntryService } from './counting-entry.service';
import {
  CreateCountingEntryRequest,
  UpdateCountingEntryRequest,
} from '../../models/counting/counting-entry.model';

describe('CountingEntryService', () => {
  let service: CountingEntryService;
  let httpMock: HttpTestingController;

  const apiBase = '/Api/V1/CarRentalManagament';
  const fleetId = '11111111-0000-0000-0000-000000000001';
  const entryId = '99999999-0000-0000-0000-000000001101';

  const apiEntry = {
    Id: entryId,
    CountingNumber: 1101,
    CountingMain: 1000,
    CountingType: 1,
    ReportNumber: 1,
    CountingLevel: 2,
    Debtir: 500,
    Credit: 0,
    Balannce: 500,
    NameAr: 'الصندوق',
    NameEn: 'Cash',
    IsDeleted: false,
  };

  const createPayload: CreateCountingEntryRequest = {
    countingNumber: 1101,
    countingMain: 1000,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 2,
    debtir: 500,
    credit: 0,
    balannce: 500,
    nameAr: 'الصندوق',
    nameEn: 'Cash',
    fleetId,
  };

  const updatePayload: UpdateCountingEntryRequest = {
    id: entryId,
    ...createPayload,
    nameAr: 'الصندوق الرئيسي',
    debtir: 750,
    credit: 25,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CountingEntryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CountingEntryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets all counting entries and sends fleet query params correctly', () => {
    service.getList(fleetId).subscribe(entries => {
      expect(entries).toEqual([
        jasmine.objectContaining({
          id: entryId,
          countingNumber: 1101,
          nameAr: 'الصندوق',
          isDeleted: false,
        }),
      ]);
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/Counting/List` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('IdFleet') === fleetId &&
      request.params.get('Fleetid') === null,
    );

    req.flush({ data: [apiEntry], succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('gets paginated counting entries with pagination, search, and ordering params', () => {
    service
      .getPaginated({
        fleetId: ` ${fleetId} `,
        pageNumber: 2,
        pageSize: 25,
        search: 'cash',
        orderBy: 'CountingNumber',
        orderByDirection: 'ASC',
      })
      .subscribe(response => {
        expect(response).toEqual(jasmine.objectContaining({ items: [apiEntry], totalCount: 1 }));
      });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/Counting/Paginated` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('PageNumber') === '2' &&
      request.params.get('PageSize') === '25' &&
      request.params.get('Search') === 'cash' &&
      request.params.get('OrderBy') === 'CountingNumber' &&
      request.params.get('OrderByDirection') === 'ASC',
    );

    req.flush({
      data: { items: [apiEntry], pageNumber: 2, pageSize: 25, totalCount: 1, totalPages: 1 },
      succeeded: true,
      errors: [],
      propertyErrors: {},
      httpStatusCode: 200,
    });
  });

  it('gets a counting entry by id and fleet id using the backend URL shape', () => {
    service.getById(entryId, fleetId).subscribe(entry => {
      expect(entry).toEqual(jasmine.objectContaining({ id: entryId, nameEn: 'Cash' }));
    });

    const req = httpMock.expectOne(`${apiBase}/Counting/${entryId}/${fleetId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: apiEntry, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a counting entry with camelCase and PascalCase payload keys expected by the API', () => {
    service.create(createPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: entryId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Counting`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      countingNumber: 1101,
      CountingNumber: 1101,
      countingMain: 1000,
      CountingMain: 1000,
      nameAr: 'الصندوق',
      NameAr: 'الصندوق',
      fleetId,
      FleetId: fleetId,
    }));
    req.flush({ data: { id: entryId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('updates a counting entry with encoded id and optional debit/credit fields', () => {
    service.update(updatePayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: entryId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Counting/${entryId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      id: entryId,
      nameAr: 'الصندوق الرئيسي',
      NameAr: 'الصندوق الرئيسي',
      debtir: 750,
      Debtir: 750,
      credit: 25,
      Credit: 25,
    }));
    req.flush({ data: { id: entryId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('soft deletes using the primary delete URL with id query parameter', () => {
    service.softDelete(entryId).subscribe(deleted => {
      expect(deleted).toBeTrue();
    });

    const req = httpMock.expectOne(`${apiBase}/Counting/${entryId}?id=${entryId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: true, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('falls back through alternate soft-delete URLs when the API rejects earlier shapes', () => {
    service.softDelete(entryId).subscribe(deleted => {
      expect(deleted).toBeTrue();
    });

    httpMock
      .expectOne(`${apiBase}/Counting/${entryId}?id=${entryId}`)
      .flush({ message: 'Method not allowed' }, { status: 405, statusText: 'Method Not Allowed' });

    httpMock
      .expectOne(`${apiBase}/Counting/${entryId}`)
      .flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    httpMock
      .expectOne(`${apiBase}/Counting?id=${entryId}`)
      .flush({ message: 'Method not allowed' }, { status: 405, statusText: 'Method Not Allowed' });

    httpMock
      .expectOne(`${apiBase}/Counting/SoftDelete/${entryId}`)
      .flush({ message: 'Method not allowed' }, { status: 405, statusText: 'Method Not Allowed' });

    const patchReq = httpMock.expectOne(`${apiBase}/Counting/SoftDelete/${entryId}`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({});
    patchReq.flush({ data: true, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('propagates API errors to the subscriber', () => {
    service.getList(fleetId).subscribe({
      next: () => fail('Expected getList to fail'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.error.errors).toEqual(['API failure']);
      },
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' && request.url === `${apiBase}/Counting/List`,
    );

    req.flush(
      { data: null, succeeded: false, errors: ['API failure'], propertyErrors: {}, httpStatusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );
  });
});
