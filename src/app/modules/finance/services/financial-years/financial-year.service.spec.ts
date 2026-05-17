import { TestBed } from '@angular/core/testing';
import { FinancialYearService } from './financial-year.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('FinancialYearService', () => {
  let service: FinancialYearService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockFinancialYear = {
    id: 'fy-2024',
    name: 'FY 2024',
    nameAr: 'السنة المالية 2024',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    isOpen: true,
    number: 2024,
  };

  const mockFinancialYearList = [
    mockFinancialYear,
    { id: 'fy-2023', name: 'FY 2023', startDate: '2023-01-01', endDate: '2023-12-31', isActive: false, isOpen: false, number: 2023 },
    { id: 'fy-2025', name: 'FY 2025', startDate: '2025-01-01', endDate: '2025-12-31', isActive: true, isOpen: false, number: 2025 },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [FinancialYearService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(FinancialYearService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all financial years', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockFinancialYearList));

      service.getList().subscribe((years) => {
        expect(years.length).toBe(3);
        expect(years[0].name).toBe('FY 2024');
        done();
      });
    });

    it('should handle empty financial year list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((years) => {
        expect(years).toEqual([]);
        done();
      });
    });

    it('should include fleet parameters', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockFinancialYearList));

      service.getList('fleet-123').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ FleetId: 'fleet-123' }),
        );
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve financial year by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockFinancialYear));

      service.getById('fy-2024').subscribe((year) => {
        expect(year.id).toBe('fy-2024');
        expect(year.name).toBe('FY 2024');
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'FY 2026',
      nameAr: 'السنة المالية 2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      number: 2026,
      isActive: true,
    };

    it('should create new financial year', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'fy-2026', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include year dates in request', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.startDate).toBe('2026-01-01');
        expect(payload.endDate).toBe('2026-12-31');
        done();
      });
    });
  });

  describe('update', () => {
    const updateRequest = {
      id: 'fy-2024',
      name: 'FY 2024 Updated',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      isOpen: false,
    };

    it('should update financial year', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should preserve year id', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.id).toBe('fy-2024');
        done();
      });
    });
  });

  describe('filtering and calculations', () => {
    it('should filter active financial years', (done) => {
      const activeYears = mockFinancialYearList.filter((y) => y.isActive);
      baseServiceSpy.getData.and.returnValue(of(activeYears));

      service.getList().subscribe((years) => {
        expect(years.every((y) => y.isActive)).toBe(true);
        done();
      });
    });

    it('should filter open financial years', (done) => {
      const openYears = mockFinancialYearList.filter((y) => y.isOpen);
      baseServiceSpy.getData.and.returnValue(of(openYears));

      service.getList().subscribe((years) => {
        expect(years.every((y) => y.isOpen)).toBe(true);
        done();
      });
    });

    it('should sort years by number descending', (done) => {
      const sortedYears = [...mockFinancialYearList].sort((a, b) => b.number - a.number);
      baseServiceSpy.getData.and.returnValue(of(sortedYears));

      service.getList().subscribe((years) => {
        expect(years[0].number).toBeGreaterThanOrEqual(years[years.length - 1].number);
        done();
      });
    });

    it('should calculate days in financial year', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockFinancialYearList));

      service.getList().subscribe((years) => {
        years.forEach((year) => {
          const startDate = new Date(year.startDate);
          const endDate = new Date(year.endDate);
          const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          expect(days).toBeGreaterThan(0);
        });
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates', (done) => {
      const leapYear = { ...mockFinancialYear, startDate: '2024-02-28', endDate: '2024-02-29' };
      baseServiceSpy.getData.and.returnValue(of([leapYear]));

      service.getList().subscribe((years) => {
        expect(years[0].startDate).toBe('2024-02-28');
        done();
      });
    });

    it('should handle year boundaries crossing', (done) => {
      const crossingYear = { ...mockFinancialYear, startDate: '2023-07-01', endDate: '2024-06-30' };
      baseServiceSpy.getData.and.returnValue(of([crossingYear]));

      service.getList().subscribe((years) => {
        expect(years[0].startDate).toBe('2023-07-01');
        expect(years[0].endDate).toBe('2024-06-30');
        done();
      });
    });
  });
});
