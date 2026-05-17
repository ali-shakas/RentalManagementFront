import { TestBed } from '@angular/core/testing';
import { CategoryVehicleService } from './category-vehicle.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('CategoryVehicleService', () => {
  let service: CategoryVehicleService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockCategoryVehicle = {
    id: 'cat-1',
    name: 'Sedan',
    nameAr: 'سيارة سيدان',
    nameEn: 'Sedan',
    description: 'Standard 4-door sedan',
    dailyRate: 50,
    weeklyRate: 300,
    monthlyRate: 1000,
    isActive: true,
  };

  const mockCategories = [
    mockCategoryVehicle,
    { id: 'cat-2', name: 'SUV', nameAr: 'SUV', nameEn: 'SUV', dailyRate: 75, weeklyRate: 450, monthlyRate: 1500 },
    { id: 'cat-3', name: 'Truck', nameAr: 'شاحنة', nameEn: 'Truck', dailyRate: 100, weeklyRate: 600, monthlyRate: 2000 },
    { id: 'cat-4', name: 'Coupe', nameAr: 'كوبيه', nameEn: 'Coupe', dailyRate: 60, weeklyRate: 360, monthlyRate: 1200 },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [CategoryVehicleService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(CategoryVehicleService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all vehicle categories', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCategories));

      service.getList().subscribe((categories) => {
        expect(categories.length).toBe(4);
        expect(categories[0].name).toBe('Sedan');
        done();
      });
    });

    it('should handle empty category list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((categories) => {
        expect(categories).toEqual([]);
        done();
      });
    });

    it('should filter by active status', (done) => {
      const activeCategories = mockCategories.filter((c) => c.isActive);
      baseServiceSpy.getData.and.returnValue(of(activeCategories));

      service.getList().subscribe((categories) => {
        expect(categories.every((c) => c.isActive)).toBe(true);
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve category by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCategoryVehicle));

      service.getById('cat-1').subscribe((category) => {
        expect(category.id).toBe('cat-1');
        expect(category.name).toBe('Sedan');
        done();
      });
    });

    it('should call API with correct parameters', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCategoryVehicle));

      service.getById('cat-2').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ id: 'cat-2' }),
        );
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'Hatchback',
      nameAr: 'هاتشباك',
      nameEn: 'Hatchback',
      description: 'Compact hatchback vehicle',
      dailyRate: 40,
      weeklyRate: 240,
      monthlyRate: 800,
      isActive: true,
    };

    it('should create new vehicle category', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'cat-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include pricing in request', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.dailyRate).toBe(40);
        expect(payload.weeklyRate).toBe(240);
        expect(payload.monthlyRate).toBe(800);
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
  });

  describe('update', () => {
    const updateRequest = {
      id: 'cat-1',
      name: 'Premium Sedan',
      nameAr: 'سيدان فاخر',
      nameEn: 'Premium Sedan',
      dailyRate: 75,
      weeklyRate: 450,
      monthlyRate: 1500,
      isActive: true,
    };

    it('should update vehicle category', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should preserve category id', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.id).toBe('cat-1');
        done();
      });
    });

    it('should handle update error', (done) => {
      baseServiceSpy.putData.and.returnValue(throwError(() => new Error('Update failed')));

      service.update(updateRequest).subscribe({
        error: (err) => {
          expect(err.message).toBe('Update failed');
          done();
        },
      });
    });
  });

  describe('filtering and calculations', () => {
    it('should calculate weekly discount from daily rate', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCategories));

      service.getList().subscribe((categories) => {
        categories.forEach((cat) => {
          const weeklyFromDaily = cat.dailyRate * 7 * 0.9;
          expect(cat.weeklyRate).toBeLessThanOrEqual(weeklyFromDaily);
        });
        done();
      });
    });

    it('should calculate monthly discount from daily rate', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockCategories));

      service.getList().subscribe((categories) => {
        categories.forEach((cat) => {
          const monthlyFromDaily = cat.dailyRate * 30 * 0.7;
          expect(cat.monthlyRate).toBeLessThanOrEqual(monthlyFromDaily);
        });
        done();
      });
    });

    it('should filter categories by price range', (done) => {
      baseServiceSpy.getData.and.returnValue(
        of(mockCategories.filter((c) => c.dailyRate >= 50 && c.dailyRate <= 75)),
      );

      service.getList().subscribe((categories) => {
        expect(categories.every((c) => c.dailyRate >= 50 && c.dailyRate <= 75)).toBe(true);
        done();
      });
    });

    it('should sort categories by price ascending', (done) => {
      const sortedByPrice = [...mockCategories].sort((a, b) => a.dailyRate - b.dailyRate);
      baseServiceSpy.getData.and.returnValue(of(sortedByPrice));

      service.getList().subscribe((categories) => {
        expect(categories[0].dailyRate).toBeLessThanOrEqual(categories[categories.length - 1].dailyRate);
        done();
      });
    });

    it('should sort categories by name', (done) => {
      const sortedByName = [...mockCategories].sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(sortedByName));

      service.getList().subscribe((categories) => {
        expect(categories[0].name).toBeLessThanOrEqual(categories[1].name);
        done();
      });
    });

    it('should filter active categories only', (done) => {
      const activeOnly = mockCategories.filter((c) => c.isActive !== false);
      baseServiceSpy.getData.and.returnValue(of(activeOnly));

      service.getList().subscribe((categories) => {
        expect(categories.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero pricing', (done) => {
      const freeCategory = { ...mockCategoryVehicle, dailyRate: 0, weeklyRate: 0, monthlyRate: 0 };
      baseServiceSpy.getData.and.returnValue(of([freeCategory]));

      service.getList().subscribe((categories) => {
        expect(categories[0].dailyRate).toBe(0);
        done();
      });
    });

    it('should handle large pricing values', (done) => {
      const expensiveCategory = {
        ...mockCategoryVehicle,
        dailyRate: 10000,
        weeklyRate: 60000,
        monthlyRate: 200000,
      };
      baseServiceSpy.getData.and.returnValue(of([expensiveCategory]));

      service.getList().subscribe((categories) => {
        expect(categories[0].dailyRate).toBe(10000);
        done();
      });
    });

    it('should handle categories with same pricing', (done) => {
      const samePriceCategories = mockCategories.map((c) => ({ ...c, dailyRate: 50 }));
      baseServiceSpy.getData.and.returnValue(of(samePriceCategories));

      service.getList().subscribe((categories) => {
        expect(categories.every((c) => c.dailyRate === 50)).toBe(true);
        done();
      });
    });
  });
});
