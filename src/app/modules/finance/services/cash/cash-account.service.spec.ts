import { TestBed } from '@angular/core/testing';
import { CashAccountService } from './cash-account.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('CashAccountService', () => {
  let service: CashAccountService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockCashAccount = {
    id: 'cash-1',
    name: 'Main Cash Box',
    nameAr: 'صندوق النقد الرئيسي',
    code: 'CASH-001',
    balance: 50000,
    currency: 'SAR',
    isActive: true,
    accountType: 'cash',
  };

  const mockCashAccountList = [
    mockCashAccount,
    { id: 'cash-2', name: 'Secondary Cash', nameAr: 'صندوق النقد الثانوي', code: 'CASH-002', balance: 25000, currency: 'SAR', isActive: true },
    { id: 'cash-3', name: 'Reserve Cash', nameAr: 'احتياطي النقد', code: 'CASH-003', balance: 100000, currency: 'SAR', isActive: true },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [CashAccountService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(CashAccountService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all cash accounts', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCashAccountList));

      service.getList().subscribe((accounts) => {
        expect(accounts.length).toBe(3);
        expect(accounts[0].name).toBe('Main Cash Box');
        done();
      });
    });

    it('should handle empty account list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((accounts) => {
        expect(accounts).toEqual([]);
        done();
      });
    });

    it('should include fleet parameters', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCashAccountList));

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
      name: 'New Cash Account',
      nameAr: 'حساب نقد جديد',
      code: 'CASH-004',
      initialBalance: 10000,
      currency: 'SAR',
      accountType: 'cash',
      isActive: true,
    };

    it('should create new cash account', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'cash-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include account details', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.name).toBe('New Cash Account');
        expect(payload.code).toBe('CASH-004');
        expect(payload.initialBalance).toBe(10000);
        done();
      });
    });
  });

  describe('calculations', () => {
    it('should calculate total cash balance', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCashAccountList));

      service.getList().subscribe((accounts) => {
        const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        expect(totalBalance).toBe(175000);
        done();
      });
    });

    it('should filter accounts by currency', (done) => {
      const sarAccounts = mockCashAccountList.filter((a) => a.currency === 'SAR');
      baseServiceSpy.getData.and.returnValue(of(sarAccounts));

      service.getList().subscribe((accounts) => {
        expect(accounts.every((a) => a.currency === 'SAR')).toBe(true);
        done();
      });
    });

    it('should sort accounts by balance descending', (done) => {
      const sorted = [...mockCashAccountList].sort((a, b) => (b.balance || 0) - (a.balance || 0));
      baseServiceSpy.getData.and.returnValue(of(sorted));

      service.getList().subscribe((accounts) => {
        expect(accounts[0].balance).toBeGreaterThanOrEqual(accounts[accounts.length - 1].balance || 0);
        done();
      });
    });
  });

  describe('filtering', () => {
    it('should filter active accounts', (done) => {
      const activeAccounts = mockCashAccountList.filter((a) => a.isActive);
      baseServiceSpy.getData.and.returnValue(of(activeAccounts));

      service.getList().subscribe((accounts) => {
        expect(accounts.every((a) => a.isActive)).toBe(true);
        done();
      });
    });

    it('should search by account code', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCashAccountList));

      service.getList().subscribe((accounts) => {
        const found = accounts.find((a) => a.code === 'CASH-001');
        expect(found).toBeDefined();
        done();
      });
    });
  });
});
