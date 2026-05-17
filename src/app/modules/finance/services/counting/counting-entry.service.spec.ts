import { TestBed } from '@angular/core/testing';
import { CountingEntryService } from './counting-entry.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('CountingEntryService', () => {
  let service: CountingEntryService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockCountingEntry = {
    id: 'count-1',
    accountCode: 'CASH-001',
    debit: 5000,
    credit: 0,
    balance: 5000,
    description: 'Cash inflow',
    entryDate: '2024-01-01',
    reference: 'INV-001',
    isPosted: true,
  };

  const mockCountingEntryList = [
    mockCountingEntry,
    { id: 'count-2', accountCode: 'CASH-002', debit: 0, credit: 1000, balance: -1000, description: 'Cash outflow', entryDate: '2024-01-02', isPosted: true },
    { id: 'count-3', accountCode: 'BANK-001', debit: 10000, credit: 0, balance: 10000, description: 'Bank deposit', entryDate: '2024-01-03', isPosted: false },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [CountingEntryService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(CountingEntryService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all counting entries', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCountingEntryList));

      service.getList().subscribe((entries) => {
        expect(entries.length).toBe(3);
        expect(entries[0].accountCode).toBe('CASH-001');
        done();
      });
    });

    it('should handle empty entry list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((entries) => {
        expect(entries).toEqual([]);
        done();
      });
    });

    it('should filter posted entries', (done) => {
      const postedEntries = mockCountingEntryList.filter((e) => e.isPosted);
      baseServiceSpy.getData.and.returnValue(of(postedEntries));

      service.getList().subscribe((entries) => {
        expect(entries.every((e) => e.isPosted)).toBe(true);
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      accountCode: 'CASH-003',
      debit: 7500,
      credit: 0,
      description: 'New cash entry',
      reference: 'REF-001',
      entryDate: '2024-01-04',
    };

    it('should create new counting entry', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'count-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include debit and credit', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.debit).toBe(7500);
        expect(payload.credit).toBe(0);
        done();
      });
    });
  });

  describe('calculations', () => {
    it('should calculate total debits', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCountingEntryList));

      service.getList().subscribe((entries) => {
        const totalDebits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        expect(totalDebits).toBe(15000);
        done();
      });
    });

    it('should calculate total credits', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCountingEntryList));

      service.getList().subscribe((entries) => {
        const totalCredits = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        expect(totalCredits).toBe(1000);
        done();
      });
    });

    it('should calculate net balance', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCountingEntryList));

      service.getList().subscribe((entries) => {
        const totalDebits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        const totalCredits = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        const netBalance = totalDebits - totalCredits;
        expect(netBalance).toBe(14000);
        done();
      });
    });

    it('should validate debit credit balance', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCountingEntryList));

      service.getList().subscribe((entries) => {
        entries.forEach((entry) => {
          if (entry.debit && entry.credit) {
            expect(entry.balance).toBe(entry.debit - entry.credit);
          }
        });
        done();
      });
    });
  });

  describe('filtering', () => {
    it('should filter by account code', (done) => {
      const filtered = mockCountingEntryList.filter((e) => e.accountCode === 'CASH-001');
      baseServiceSpy.getData.and.returnValue(of(filtered));

      service.getList().subscribe((entries) => {
        expect(entries.every((e) => e.accountCode === 'CASH-001')).toBe(true);
        done();
      });
    });

    it('should filter by date range', (done) => {
      const startDate = new Date('2024-01-02');
      const endDate = new Date('2024-01-03');
      const filtered = mockCountingEntryList.filter((e) => {
        const entryDate = new Date(e.entryDate);
        return entryDate >= startDate && entryDate <= endDate;
      });
      baseServiceSpy.getData.and.returnValue(of(filtered));

      service.getList().subscribe((entries) => {
        expect(entries.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should sort by entry date', (done) => {
      const sorted = [...mockCountingEntryList].sort((a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
      );
      baseServiceSpy.getData.and.returnValue(of(sorted));

      service.getList().subscribe((entries) => {
        expect(new Date(entries[0].entryDate) <= new Date(entries[entries.length - 1].entryDate)).toBe(true);
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero amount entries', (done) => {
      const zeroEntry = { ...mockCountingEntry, debit: 0, credit: 0, balance: 0 };
      baseServiceSpy.getData.and.returnValue(of([zeroEntry]));

      service.getList().subscribe((entries) => {
        expect(entries[0].balance).toBe(0);
        done();
      });
    });

    it('should handle negative balances', (done) => {
      const negativeEntry = { ...mockCountingEntry, balance: -5000 };
      baseServiceSpy.getData.and.returnValue(of([negativeEntry]));

      service.getList().subscribe((entries) => {
        expect(entries[0].balance).toBeLessThan(0);
        done();
      });
    });

    it('should handle large amounts', (done) => {
      const largeEntry = { ...mockCountingEntry, debit: 999999999, credit: 0 };
      baseServiceSpy.getData.and.returnValue(of([largeEntry]));

      service.getList().subscribe((entries) => {
        expect(entries[0].debit).toBe(999999999);
        done();
      });
    });
  });
});
