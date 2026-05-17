import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../services/users/user.service';
import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmService } from '../../../../../shared/services/confirm.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authStateSpy: jasmine.SpyObj<AuthStateService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let confirmServiceSpy: jasmine.SpyObj<ConfirmService>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;

  const mockPaginatedResponse = {
    items: [
      { id: '1', userName: 'user1', email: 'user1@example.com', nameEn: 'User One', isActive: true },
      { id: '2', userName: 'user2', email: 'user2@example.com', nameEn: 'User Two', isActive: true },
    ],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    const userServiceMock = jasmine.createSpyObj('UserService', ['getPaginated', 'getList']);
    const authStateMock = jasmine.createSpyObj('AuthStateService', [], {
      isSuperAdmin: signal(false),
      fleetId: signal('fleet-1'),
    });
    const toastServiceMock = jasmine.createSpyObj('ToastService', ['success', 'error', 'warning']);
    const confirmServiceMock = jasmine.createSpyObj('ConfirmService', ['confirm']);
    const translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent, TranslateModule.forRoot()],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthStateService, useValue: authStateMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ConfirmService, useValue: confirmServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
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
      expect(component.loading()).toBe(false);
      expect(component.users().length).toBe(0);
    });

    it('should load users on init', (done) => {
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      fixture.detectChanges();

      setTimeout(() => {
        expect(userServiceSpy.getPaginated).toHaveBeenCalled();
        expect(component.users().length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should set isSuperAdmin signal', () => {
      const isSuperAdminSignal = authStateSpy.isSuperAdmin as jasmine.Spy;
      isSuperAdminSignal.and.returnValue(true);

      expect(component.isSuperAdmin()).toBe(true);
    });
  });

  describe('loading and pagination', () => {
    it('should load user list', (done) => {
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.load();

      setTimeout(() => {
        expect(component.users().length).toBe(2);
        expect(component.totalCount()).toBe(2);
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });

    it('should handle load error', (done) => {
      const error = new Error('Load failed');
      userServiceSpy.getPaginated.and.returnValue(throwError(() => error));

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
        totalCount: 25,
        totalPages: 3,
      };
      userServiceSpy.getPaginated.and.returnValue(of(multiPageResponse));

      component.load();

      setTimeout(() => {
        expect(component.totalPages()).toBe(3);
        expect(component.pageNumbers().length).toBe(3);
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
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));
      component.totalPages.set(3);

      component.goToPage(2);

      setTimeout(() => {
        expect(component.pageNumber()).toBe(2);
        expect(userServiceSpy.getPaginated).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should not navigate to current page', () => {
      component.pageNumber.set(1);
      component.totalPages.set(3);
      const initialCallCount = userServiceSpy.getPaginated.calls.count();

      component.goToPage(1);

      expect(userServiceSpy.getPaginated.calls.count()).toBe(initialCallCount);
    });
  });

  describe('page size', () => {
    it('should change page size', (done) => {
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

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
      const initialCallCount = userServiceSpy.getPaginated.calls.count();

      component.changePageSize(10);

      expect(userServiceSpy.getPaginated.calls.count()).toBe(initialCallCount);
    });
  });

  describe('search and filtering', () => {
    it('should search users', (done) => {
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.search.set('john');
      component.onSearch();

      setTimeout(() => {
        expect(userServiceSpy.getPaginated).toHaveBeenCalledWith(
          jasmine.objectContaining({ search: 'john' }),
        );
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });

    it('should reset page on search', (done) => {
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));
      component.pageNumber.set(3);

      component.search.set('test');
      component.onSearch();

      setTimeout(() => {
        expect(component.pageNumber()).toBe(1);
        done();
      }, 100);
    });

    it('should handle empty search', (done) => {
      userServiceSpy.getPaginated.and.returnValue(of(mockPaginatedResponse));

      component.search.set('');
      component.onSearch();

      setTimeout(() => {
        expect(component.pageNumber()).toBe(1);
        expect(userServiceSpy.getPaginated).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('display functions', () => {
    it('should display roles from roles array', () => {
      const user = {
        id: '1',
        userName: 'user1',
        email: 'test@example.com',
        isActive: true,
        roles: [
          { id: 'role-1', name: 'Admin', displayName: 'Administrator' },
          { id: 'role-2', name: 'Manager', displayName: 'Manager' },
        ],
      };

      const display = component.rolesDisplay(user);

      expect(display).toContain('Administrator');
      expect(display).toContain('Manager');
    });

    it('should display count from userRoles when roles not available', () => {
      const user = {
        id: '1',
        userName: 'user1',
        email: 'test@example.com',
        isActive: true,
        userRoles: [
          { roleLookupId: 'role-1', userId: '1' },
          { roleLookupId: 'role-2', userId: '1' },
        ],
      };
      translateServiceSpy.instant.and.returnValue('role(s)');

      const display = component.rolesDisplay(user);

      expect(display).toContain('2');
      expect(display).toContain('role(s)');
    });

    it('should display dash when no roles', () => {
      const user = {
        id: '1',
        userName: 'user1',
        email: 'test@example.com',
        isActive: true,
      };

      const display = component.rolesDisplay(user);

      expect(display).toBe('-');
    });

    it('should display fleet id', () => {
      const user = {
        id: '1',
        userName: 'user1',
        email: 'test@example.com',
        isActive: true,
        fleetId: 'fleet-123',
      };

      const display = component.fleetDisplay(user);

      expect(display).toBe('fleet-123');
    });

    it('should display dash when no fleet id', () => {
      const user = {
        id: '1',
        userName: 'user1',
        email: 'test@example.com',
        isActive: true,
      };

      const display = component.fleetDisplay(user);

      expect(display).toBe('-');
    });
  });

  describe('error handling', () => {
    it('should show error message on load failure', (done) => {
      const error = { message: 'Network error' };
      userServiceSpy.getPaginated.and.returnValue(throwError(() => error));

      component.load();

      setTimeout(() => {
        expect(toastServiceSpy.error).toHaveBeenCalledWith('Network error');
        expect(component.loadFailed()).toBe(true);
        done();
      }, 100);
    });

    it('should show default error message when no message provided', (done) => {
      userServiceSpy.getPaginated.and.returnValue(throwError(() => new Error()));

      component.load();

      setTimeout(() => {
        expect(toastServiceSpy.error).toHaveBeenCalledWith('Failed to load users');
        done();
      }, 100);
    });
  });
});
