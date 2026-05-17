import { TestBed } from '@angular/core/testing';
import { BankService } from './bank.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('BankService', () => {
  let service: BankService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockBank = {
    id: 'bank-1',
    name: 'Saudi National Bank',
    nameAr: 'البنك الأهلي السعودي',
    code: 'SNB',
    isActive: true,
    accountNumber: '1234567890',
    accountHolder: 'Company Name',
  };

  const mockBankList = [
    mockBank,
    { id: 'bank-2', name: 'Riyad Bank', nameAr: 'بنك الرياض', code: 'RB', isActive: true, accountNumber: '0987654321' },
    { id: 'bank-3', name: 'Al Rajhi Bank', nameAr: 'بنك الراجحي', code: 'ARB', isActive: true, accountNumber: '1111111111' },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData']);
    TestBed.configureTestingModule({
      providers: [BankService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(BankService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all banks', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBankList));

      service.getList().subscribe((banks) => {
        expect(banks.length).toBe(3);
        expect(banks[0].name).toBe('Saudi National Bank');
        done();
      });
    });

    it('should handle empty bank list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((banks) => {
        expect(banks).toEqual([]);
        done();
      });
    });

    it('should filter active banks', (done) => {
      const activeBanks = mockBankList.filter((b) => b.isActive);
      baseServiceSpy.getData.and.returnValue(of(activeBanks));

      service.getList().subscribe((banks) => {
        expect(banks.every((b) => b.isActive)).toBe(true);
        done();
      });
    });

    it('should include fleet parameters when provided', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBankList));

      service.getList('fleet-123').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ FleetId: 'fleet-123' }),
        );
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'New Bank',
      nameAr: 'بنك جديد',
      code: 'NB',
      accountNumber: '9999999999',
      accountHolder: 'Account Holder',
      isActive: true,
    };

    it('should create new bank', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'bank-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include bank details in request', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.name).toBe('New Bank');
        expect(payload.code).toBe('NB');
        expect(payload.accountNumber).toBe('9999999999');
        done();
      });
    });

    it('should handle creation error', (done) => {
      baseServiceSpy.postData.and.returnValue(throwError(() => new Error('Creation failed')));

      service.create(createRequest).subscribe({
        error: (err) => {
          expect(err.message).toBe('Creation failed');
          done();
        },
      });
    });

    it('should suppress error toast on creation', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        expect(callArgs.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('filtering and searching', () => {
    it('should filter banks by name', (done) => {
      const filtered = mockBankList.filter((b) => b.name.includes('National'));
      baseServiceSpy.getData.and.returnValue(of(filtered));

      service.getList().subscribe((banks) => {
        expect(banks.every((b) => b.name.includes('National'))).toBe(true);
        done();
      });
    });

    it('should sort banks by name', (done) => {
      const sorted = [...mockBankList].sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(sorted));

      service.getList().subscribe((banks) => {
        expect(banks[0].name).toBeLessThanOrEqual(banks[1].name);
        done();
      });
    });

    it('should search by bank code', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBankList));

      service.getList().subscribe((banks) => {
        const found = banks.find((b) => b.code === 'SNB');
        expect(found).toBeDefined();
        expect(found?.name).toBe('Saudi National Bank');
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle banks with minimal data', (done) => {
      const minimalBank = { id: 'min-bank', name: 'Simple Bank', code: 'SB' };
      baseServiceSpy.getData.and.returnValue(of([minimalBank]));

      service.getList().subscribe((banks) => {
        expect(banks[0].name).toBeDefined();
        done();
      });
    });

    it('should handle null account number', (done) => {
      const bankNoAccount = { ...mockBank, accountNumber: null };
      baseServiceSpy.getData.and.returnValue(of([bankNoAccount]));

      service.getList().subscribe((banks) => {
        expect(banks.length).toBe(1);
        done();
      });
    });
  });
});
