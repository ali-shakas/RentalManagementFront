import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { JournalEntryService } from '../journals/journal-entry.service';
import { CreateJournalEntryRequest } from '../../models/journals/journal-entry.model';

describe('JournalEntryService', () => {
  let service: JournalEntryService;
  let httpMock: HttpTestingController;

  const apiBase = '/Api/V1/CarRentalManagament';
  const fleetId = '11111111-0000-0000-0000-000000000001';
  const journalId = '88888888-0000-0000-0000-000000000301';
  const financialYearId = '77777777-0000-0000-0000-000000000401';
  const countingCashId = '99999999-0000-0000-0000-000000001101';
  const countingRevenueId = '99999999-0000-0000-0000-000000004101';

  const apiJournal = {
    Id: journalId,
    JournalNumper: 25,
    Date: '2026-05-19T09:00:00',
    Node: 'قيد قبض تأجير',
    JournalType: true,
    Status: 1,
    Debtir: 100,
    Credit: 100,
    Balannce: 0,
    OperationType: 2,
    IsSystemOperation: false,
    IdFinancialYear: financialYearId,
    IdBranch: 12,
    FleetId: fleetId,
  };

  const apiDetails = [
    {
      IdCounting: countingCashId,
      Debtir: 100,
      Credit: 0,
      Balannce: 100,
      Node: 'Cash line',
      IdVehicle: 7,
      CustomerId: 33,
    },
    {
      IdCounting: countingRevenueId,
      Debtir: 0,
      Credit: 100,
      Balannce: -100,
      Node: 'Revenue line',
    },
  ];

  const createPayload: CreateJournalEntryRequest = {
    date: '2026-05-19T09:00:00',
    node: 'قيد قبض تأجير',
    journalType: true,
    debtir: 100,
    credit: 100,
    balannce: 0,
    operationType: 2,
    status: 1,
    isSystemOperation: false,
    idFinancialYear: financialYearId,
    idBranch: 12,
    fleetId,
    details: [
      {
        idCounting: countingCashId,
        debtir: 100,
        credit: 0,
        balannce: 100,
        node: 'Cash line',
        status: 1,
        idVehicle: 7,
        customerId: 33,
      },
      {
        idCounting: countingRevenueId,
        debtir: 0,
        credit: 100,
        balannce: -100,
        node: 'Revenue line',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JournalEntryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(JournalEntryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets all journals and sends fleet query params correctly', () => {
    service.getList(fleetId).subscribe(entries => {
      expect(entries).toEqual([
        jasmine.objectContaining({
          id: journalId,
          journalNumper: 25,
          node: 'قيد قبض تأجير',
          debtir: 100,
          credit: 100,
        }),
      ]);
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/Journal/List` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('IdFleet') === fleetId &&
      request.params.get('Fleetid') === null,
    );

    req.flush({ data: [apiJournal], succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('gets paginated journals with pagination, search, ordering, fleet, and filters params', () => {
    service
      .getPaginated({
        fleetId,
        branchId: 12,
        pageNumber: 3,
        pageSize: 20,
        search: ' rent ',
        orderBy: 'CreatedAt',
        orderByDirection: 'ASC',
        status: 1,
        journalType: true,
        operationType: 2,
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
      })
      .subscribe(response => {
        expect(response.items).toEqual([
          jasmine.objectContaining({ id: journalId, node: 'قيد قبض تأجير' }),
        ]);
        expect(response.totalCount).toBe(1);
      });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' &&
      request.url === `${apiBase}/Journal/Paginated` &&
      request.params.get('FleetId') === fleetId &&
      request.params.get('PageNumber') === '3' &&
      request.params.get('PageSize') === '20' &&
      request.params.get('Search') === 'rent' &&
      request.params.get('OrderBy') === 'CreatedAt' &&
      request.params.get('OrderByDirection') === 'ASC' &&
      request.params.get('BRANCHID') === '12' &&
      request.params.get('Status') === '1' &&
      request.params.get('JournalType') === 'true' &&
      request.params.get('OperationType') === '2' &&
      request.params.get('DateFrom') === '2026-05-01' &&
      request.params.get('DateTo') === '2026-05-31',
    );

    req.flush({
      data: { items: [apiJournal], pageNumber: 3, pageSize: 20, totalCount: 1, totalPages: 1 },
      succeeded: true,
      errors: [],
      propertyErrors: {},
      httpStatusCode: 200,
    });
  });

  it('gets journal by id using the actual backend URL shape', () => {
    service.getById(` ${journalId} `, ` ${fleetId} `).subscribe(entry => {
      expect(entry).toEqual(jasmine.objectContaining({
        id: journalId,
        fleetId,
        idBranch: 12,
      }));
    });

    const req = httpMock.expectOne(`${apiBase}/Journal/${journalId}/${fleetId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: apiJournal, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('gets journal by id with details from nested response payload', () => {
    service.getByIdWithDetails(journalId, fleetId).subscribe(response => {
      expect(response.entry).toEqual(jasmine.objectContaining({ id: journalId }));
      expect(response.details.length).toBe(2);
      expect(response.details[0]).toEqual(jasmine.objectContaining({ IdCounting: countingCashId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Journal/${journalId}/${fleetId}`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data: { Data: { ...apiJournal, JournalDetails: apiDetails } },
      succeeded: true,
      errors: [],
      propertyErrors: {},
      httpStatusCode: 200,
    });
  });

  it('gets journal details by journal id using the details URL', () => {
    service.getDetailsByJournalId(journalId, fleetId).subscribe(details => {
      expect(details).toEqual(apiDetails);
    });

    const req = httpMock.expectOne(`${apiBase}/Journal/${journalId}/Details/${fleetId}`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: apiDetails, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a journal entry and maps header fields correctly', () => {
    service.create(createPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: journalId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Journal`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({
      date: '2026-05-19T09:00:00',
      node: 'قيد قبض تأجير',
      journalType: true,
      debtir: 100,
      credit: 100,
      balannce: 0,
      operationType: 2,
      status: 1,
      isSystemOperation: false,
      idFinancialYear: financialYearId,
      idBranch: 12,
      fleetId,
    }));
    req.flush({ data: { id: journalId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a journal entry and maps journal detail lines correctly', () => {
    service.create(createPayload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: journalId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Journal`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.details).toEqual([
      jasmine.objectContaining({
        idCounting: countingCashId,
        debtir: 100,
        credit: 0,
        balannce: 100,
        node: 'Cash line',
        status: 1,
        idVehicle: 7,
        customerId: 33,
      }),
      jasmine.objectContaining({
        idCounting: countingRevenueId,
        debtir: 0,
        credit: 100,
        balannce: -100,
        node: 'Revenue line',
        status: null,
        idVehicle: null,
        customerId: null,
      }),
    ]);
    req.flush({ data: { id: journalId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('creates a journal with empty details when the service receives an empty details array', () => {
    service.create({ ...createPayload, debtir: 0, credit: 0, balannce: 0, details: [] }).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: journalId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Journal`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.debtir).toBe(0);
    expect(req.request.body.credit).toBe(0);
    expect(req.request.body.details).toEqual([]);
    req.flush({ data: { id: journalId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('maps null optional detail fields when vehicle, customer, and status are omitted', () => {
    const payload: CreateJournalEntryRequest = {
      ...createPayload,
      details: [
        {
          idCounting: countingCashId,
          debtir: 0,
          credit: 0,
          balannce: 0,
        },
      ],
    };

    service.create(payload).subscribe(response => {
      expect(response).toEqual(jasmine.objectContaining({ id: journalId }));
    });

    const req = httpMock.expectOne(`${apiBase}/Journal`);
    expect(req.request.body.details[0]).toEqual(jasmine.objectContaining({
      idCounting: countingCashId,
      debtir: 0,
      credit: 0,
      balannce: 0,
      node: undefined,
      status: null,
      idVehicle: null,
      customerId: null,
    }));
    req.flush({ data: { id: journalId }, succeeded: true, errors: [], propertyErrors: {}, httpStatusCode: 200 });
  });

  it('propagates API errors to the subscriber', () => {
    service.getList(fleetId).subscribe({
      next: () => fail('Expected getList to fail'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.error.errors).toEqual(['Journal API failure']);
      },
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET' && request.url === `${apiBase}/Journal/List`,
    );

    req.flush(
      { data: null, succeeded: false, errors: ['Journal API failure'], propertyErrors: {}, httpStatusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );
  });
});
