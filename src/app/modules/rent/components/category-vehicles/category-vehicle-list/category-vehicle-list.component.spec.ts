import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryVehicleListComponent } from './category-vehicle-list.component';
import { CategoryVehicleService } from '../../../services/category-vehicles/category-vehicle.service';
import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('CategoryVehicleListComponent', () => {
  let component: CategoryVehicleListComponent;
  let fixture: ComponentFixture<CategoryVehicleListComponent>;
  let categoryVehicleServiceSpy: jasmine.SpyObj<CategoryVehicleService>;
  let authStateSpy: jasmine.SpyObj<AuthStateService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockCategory = {
    id: 'cat-1',
    name: 'Sedan',
    nameEn: 'Sedan',
    dailyRate: 50,
    weeklyRate: 300,
    monthlyRate: 1000,
    isActive: true,
  };

  const mockPaginatedResponse = {
    items: [mockCategory, { id: 'cat-2', name: 'SUV', dailyRate: 75, weeklyRate: 450, monthlyRate: 1500 }],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    const categoryVehicleServiceMock = jasmine.createSpyObj('CategoryVehicleService', ['getPaginated']);
    const authStateMock = jasmine.createSpyObj('AuthStateService', [], {
      fleetId: signal('fleet-1'),
    });
    const toastServiceMock = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [CategoryVehicleListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: CategoryVehicleService, useValue: categoryVehicleServiceMock },
        { provide: AuthStateService, useValue: authStateMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryVehicleListComponent);
    component = fixture.componentInstance;
    categoryVehicleServiceSpy = TestBed.inject(CategoryVehicleService) as jasmine.SpyObj<CategoryVehicleService>;
    authStateSpy = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
  });

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.pageNumber()).toBe(1);
      expect(component.pageSize()).toBe(10);
      expect(component.search()).toBe('');
      expect(component.categories().length).toBe(0);
    });

    it('should load categories on init', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      fixture.detectChanges();

      setTimeout(() => {
        expect(categoryVehicleServiceSpy.getPaginated).toHaveBeenCalled();
        expect(component.categories().length).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });

  describe('loading and pagination', () => {
    it('should load category list', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.load();

      setTimeout(() => {
        expect(component.categories().length).toBe(2);
        expect(component.totalCount()).toBe(2);
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle load error', (done) => {
      const error = new Error('Load failed');
      categoryVehicleServiceSpy.getPaginated.and.returnValue(throwError(() => error));
      translateServiceSpy.instant.and.returnValue('Failed to load vehicle categories');

      component.load();

      setTimeout(() => {
        expect(component.loadFailed()).toBe(true);
        expect(toastServiceSpy.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should navigate to page', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));
      component.totalPages.set(3);

      component.goToPage(2);

      setTimeout(() => {
        expect(component.pageNumber()).toBe(2);
        done();
      }, 100);
    });

    it('should change page size', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.changePageSize(20);

      setTimeout(() => {
        expect(component.pageSize()).toBe(20);
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });
  });

  describe('search and filtering', () => {
    it('should search categories', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.search.set('sedan');
      component.onSearch();

      setTimeout(() => {
        expect(categoryVehicleServiceSpy.getPaginated).toHaveBeenCalledWith(
          jasmine.objectContaining({ search: 'sedan' }),
        );
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });

    it('should include fleet id in request', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.load();

      setTimeout(() => {
        expect(categoryVehicleServiceSpy.getPaginated).toHaveBeenCalledWith(
          jasmine.objectContaining({ fleetId: 'fleet-1' }),
        );
        done();
      }, 100);
    });
  });

  describe('number formatting', () => {
    it('should format numeric values', () => {
      const formatted = component.formatRangeValue(1000.5);

      expect(formatted).toBeTruthy();
      expect(formatted).not.toBe('-');
    });

    it('should handle null values', () => {
      const formatted = component.formatRangeValue(null);

      expect(formatted).toBe('-');
    });

    it('should handle undefined values', () => {
      const formatted = component.formatRangeValue(undefined);

      expect(formatted).toBe('-');
    });

    it('should format integers without decimals', () => {
      const formatted = component.formatRangeValue(1000);

      expect(formatted).toContain('1');
    });

    it('should format decimals with 2 places', () => {
      const formatted = component.formatRangeValue(1000.567);

      expect(formatted).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should show error on load failure', (done) => {
      categoryVehicleServiceSpy.getPaginated.and.returnValue(throwError(() => new Error('Failed')));
      translateServiceSpy.instant.and.returnValue('Failed to load vehicle categories');

      component.load();

      setTimeout(() => {
        expect(toastServiceSpy.error).toHaveBeenCalled();
        expect(component.loadFailed()).toBe(true);
        done();
      }, 100);
    });
  });
});
