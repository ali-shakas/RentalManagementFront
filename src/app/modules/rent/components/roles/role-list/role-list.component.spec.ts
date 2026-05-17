import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleListComponent } from './role-list.component';
import { RoleService } from '../../../services/roles/role.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../../models';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockRole = {
    id: 'role-1',
    name: 'Admin',
    displayName: 'مسؤول',
    displayNameEn: 'Administrator',
  };

  const mockPaginatedResponse: ApiResponse<{ items: any[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }> = {
    succeeded: true,
    data: {
      items: [mockRole, { id: 'role-2', name: 'Manager', displayName: 'مدير' }],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
    },
    errors: [],
    propertyErrors: {},
    httpStatusCode: 200,
  };

  beforeEach(async () => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', ['getPaginated', 'getList']);
    const toastServiceMock = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [RoleListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: RoleService, useValue: roleServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
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
      expect(component.loading()).toBe(false);
      expect(component.roles().length).toBe(0);
    });

    it('should load roles on init', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      fixture.detectChanges();

      setTimeout(() => {
        expect(roleServiceSpy.getPaginated).toHaveBeenCalled();
        expect(component.roles().length).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });

  describe('loading and pagination', () => {
    it('should load role list', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.load();

      setTimeout(() => {
        expect(component.roles().length).toBe(2);
        expect(component.totalCount()).toBe(2);
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle load error', (done) => {
      const error = new Error('Load failed');
      roleServiceSpy.getPaginated.and.returnValue(throwError(() => error));
      translateServiceSpy.instant.and.returnValue('Failed to load roles');

      component.load();

      setTimeout(() => {
        expect(component.loadFailed()).toBe(true);
        expect(toastServiceSpy.error).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should calculate correct page numbers', (done) => {
      const multiPageResponse = {
        ...mockPaginatedResponse,
        data: {
          ...mockPaginatedResponse.data,
          totalPages: 5,
        },
      };
      roleServiceSpy.getPaginated.and.returnValue(of(multiPageResponse));

      component.load();

      setTimeout(() => {
        expect(component.totalPages()).toBe(5);
        expect(component.pageNumbers().length).toBe(5);
        done();
      }, 100);
    });

    it('should not navigate to invalid page', () => {
      component.pageNumber.set(1);
      component.totalPages.set(3);

      component.goToPage(5);

      expect(component.pageNumber()).toBe(1);
    });

    it('should navigate to valid page', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));
      component.totalPages.set(3);

      component.goToPage(2);

      setTimeout(() => {
        expect(component.pageNumber()).toBe(2);
        expect(roleServiceSpy.getPaginated).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not navigate to current page', () => {
      component.pageNumber.set(1);
      component.totalPages.set(3);
      const initialCallCount = roleServiceSpy.getPaginated.calls.count();

      component.goToPage(1);

      expect(roleServiceSpy.getPaginated.calls.count()).toBe(initialCallCount);
    });
  });

  describe('page size', () => {
    it('should change page size', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.changePageSize(20);

      setTimeout(() => {
        expect(component.pageSize()).toBe(20);
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });

    it('should not change to invalid page size', () => {
      component.pageSize.set(10);

      component.changePageSize(0);

      expect(component.pageSize()).toBe(10);
    });

    it('should not change to same page size', () => {
      component.pageSize.set(10);
      const initialCallCount = roleServiceSpy.getPaginated.calls.count();

      component.changePageSize(10);

      expect(roleServiceSpy.getPaginated.calls.count()).toBe(initialCallCount);
    });
  });

  describe('search and filtering', () => {
    it('should search roles', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.search.set('admin');
      component.onSearch();

      setTimeout(() => {
        expect(roleServiceSpy.getPaginated).toHaveBeenCalledWith(
          jasmine.objectContaining({ search: 'admin' }),
        );
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });

    it('should reset page on search', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));
      component.pageNumber.set(3);

      component.search.set('test');
      component.onSearch();

      setTimeout(() => {
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });

    it('should handle empty search', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.search.set('');
      component.onSearch();

      setTimeout(() => {
        expect(component.pageNumber()).toBe(1);
        expect(roleServiceSpy.getPaginated).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('error handling', () => {
    it('should show error message on load failure', (done) => {
      const error = { message: 'Network error' };
      roleServiceSpy.getPaginated.and.returnValue(throwError(() => error));
      translateServiceSpy.instant.and.returnValue('Failed to load roles');

      component.load();

      setTimeout(() => {
        expect(toastServiceSpy.error).toHaveBeenCalledWith('Failed to load roles');
        expect(component.loadFailed()).toBe(true);
        done();
      }, 100);
    });

    it('should show default error message when no message provided', (done) => {
      roleServiceSpy.getPaginated.and.returnValue(throwError(() => new Error()));
      translateServiceSpy.instant.and.returnValue('Failed to load roles');

      component.load();

      setTimeout(() => {
        expect(toastServiceSpy.error).toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});
