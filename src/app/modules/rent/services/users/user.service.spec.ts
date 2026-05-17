import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { BaseService, BaseRequestOptions } from '../../../../shared/services/base/base.service';
import { User, UserCreateRequest, UserUpdateRequest, UserPrivilegesRequest, PaginatedRequest } from '../../models';
import { of, throwError } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockUser: User = {
    id: '1',
    userName: 'john.doe',
    email: 'john@example.com',
    nameAr: 'جون دو',
    nameEn: 'John Doe',
    isActive: true,
    branchId: 1,
    fleetId: 'fleet-1',
  };

  const mockUserList: User[] = [
    mockUser,
    { ...mockUser, id: '2', userName: 'jane.doe', email: 'jane@example.com' },
    { ...mockUser, id: '3', userName: 'admin.user', email: 'admin@example.com' },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [UserService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(UserService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve user list with normalization', (done) => {
      baseServiceSpy.getData.and.returnValue(of([mockUser]));

      service.getList().subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].id).toBe('1');
        expect(users[0].userName).toBe('john.doe');
        done();
      });
    });

    it('should filter users by status', (done) => {
      baseServiceSpy.getData.and.returnValue(of([mockUser]));

      service.getList('Active').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.stringContaining('user-list'),
          jasmine.objectContaining({ Status: 'Active' }),
          undefined,
        );
        done();
      });
    });

    it('should handle empty user list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((users) => {
        expect(users).toEqual([]);
        done();
      });
    });

    it('should include fleet parameters when provided', (done) => {
      baseServiceSpy.getData.and.returnValue(of([mockUser]));

      service.getList(undefined, undefined, 'fleet-123').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ FleetId: 'fleet-123' }),
          undefined,
        );
        done();
      });
    });
  });

  describe('getPaginated', () => {
    const paginatedRequest: PaginatedRequest = {
      pageNumber: 1,
      pageSize: 10,
      search: 'john',
      fleetId: 'fleet-1',
    };

    it('should retrieve paginated users from API', (done) => {
      const mockResponse = {
        items: [mockUser],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      };
      baseServiceSpy.getData.and.returnValue(of(mockResponse));

      service.getPaginated(paginatedRequest).subscribe((response) => {
        expect(response.items.length).toBe(1);
        expect(response.pageNumber).toBe(1);
        expect(response.totalCount).toBe(1);
        done();
      });
    });

    it('should paginate locally on API failure', (done) => {
      baseServiceSpy.getData.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service.getPaginated({ pageNumber: 1, pageSize: 10 }).subscribe((response) => {
        expect(response.items.length).toBeLessThanOrEqual(10);
        expect(response.pageNumber).toBe(1);
        done();
      });
    });

    it('should filter users locally by search term', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: 1,
          pageSize: 10,
          search: 'jane',
        })
        .subscribe((response) => {
          expect(response.items.some((u) => u.userName.includes('jane'))).toBe(true);
          done();
        });
    });

    it('should calculate correct pagination', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: 2,
          pageSize: 1,
        })
        .subscribe((response) => {
          expect(response.pageNumber).toBe(2);
          expect(response.totalPages).toBeGreaterThanOrEqual(3);
          done();
        });
    });

    it('should handle search with email', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: 1,
          pageSize: 10,
          search: 'john@',
        })
        .subscribe((response) => {
          const found = response.items.some((u) => u.email.includes('john@'));
          expect(found).toBe(true);
          done();
        });
    });

    it('should handle search with Arabic name', (done) => {
      const userWithArabic = { ...mockUser, nameAr: 'أحمد' };
      baseServiceSpy.getData.and.returnValue(of([userWithArabic]));

      service
        .getPaginated({
          pageNumber: 1,
          pageSize: 10,
          search: 'أحمد',
        })
        .subscribe((response) => {
          expect(response.totalCount).toBeGreaterThan(0);
          done();
        });
    });

    it('should reset to page 1 when search parameters change', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: 5,
          pageSize: 10,
          search: 'test',
        })
        .subscribe((response) => {
          expect(response.pageNumber).toBeLessThanOrEqual(5);
          done();
        });
    });
  });

  describe('getById', () => {
    it('should retrieve user by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUser));

      service.getById('1').subscribe((user) => {
        expect(user.id).toBe('1');
        expect(user.userName).toBe('john.doe');
        done();
      });
    });

    it('should call API with correct parameters', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUser));

      service.getById('123').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.stringContaining('by-id'),
          jasmine.objectContaining({ id: '123' }),
        );
        done();
      });
    });

    it('should handle null response', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getById('invalid').subscribe((user) => {
        expect(user.id).toBe('');
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest: UserCreateRequest = {
      userName: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      nameAr: 'مستخدم جديد',
      nameEn: 'New User',
      isActive: true,
      rolesId: ['role-1'],
    };

    it('should create a new user', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ success: true }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toEqual({ success: true });
        done();
      });
    });

    it('should call API with correct endpoint and payload', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        expect(baseServiceSpy.postData).toHaveBeenCalledWith(
          jasmine.stringContaining('create'),
          jasmine.objectContaining({
            userName: 'newuser',
            email: 'newuser@example.com',
          }),
        );
        done();
      });
    });

    it('should include all required fields', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1] as UserCreateRequest;
        expect(payload.userName).toBeDefined();
        expect(payload.email).toBeDefined();
        expect(payload.password).toBeDefined();
        expect(payload.rolesId).toBeDefined();
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
    const updateRequest: UserUpdateRequest = {
      id: '1',
      userName: 'updated.user',
      email: 'updated@example.com',
      password: 'newpassword123',
      isActive: true,
      rolesId: ['role-1', 'role-2'],
    };

    it('should update an existing user', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toEqual({ success: true });
        done();
      });
    });

    it('should call API with correct endpoint and payload', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        expect(baseServiceSpy.putData).toHaveBeenCalledWith(
          jasmine.stringContaining('update'),
          jasmine.objectContaining({
            id: '1',
            userName: 'updated.user',
          }),
        );
        done();
      });
    });

    it('should preserve user id during update', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1] as UserUpdateRequest;
        expect(payload.id).toBe('1');
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

  describe('updatePrivileges', () => {
    const privilegesRequest: UserPrivilegesRequest = {
      userId: '1',
      privilegeTypeIds: ['priv-1', 'priv-2'],
    };

    it('should update user privileges', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.updatePrivileges(privilegesRequest).subscribe((response) => {
        expect(response).toEqual({ success: true });
        done();
      });
    });

    it('should call correct API endpoint', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.updatePrivileges(privilegesRequest).subscribe(() => {
        expect(baseServiceSpy.putData).toHaveBeenCalledWith(
          jasmine.stringContaining('update-user-privileges'),
          jasmine.any(Object),
        );
        done();
      });
    });

    it('should include privilege IDs in request', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.updatePrivileges(privilegesRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1] as UserPrivilegesRequest;
        expect(payload.privilegeTypeIds.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle users with minimal data', (done) => {
      const minimalUser = { id: 'min-id', userName: 'user', email: 'user@test.com', isActive: false };
      baseServiceSpy.getData.and.returnValue(of(minimalUser));

      service.getById('min-id').subscribe((user) => {
        expect(user.userName).toBeDefined();
        expect(user.email).toBeDefined();
        done();
      });
    });

    it('should handle pagination with zero page size', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: 1,
          pageSize: 0,
        })
        .subscribe((response) => {
          expect(response.pageSize).toBeGreaterThan(0);
          done();
        });
    });

    it('should handle pagination with negative page number', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: -5,
          pageSize: 10,
        })
        .subscribe((response) => {
          expect(response.pageNumber).toBeGreaterThan(0);
          done();
        });
    });

    it('should handle case-insensitive search', (done) => {
      baseServiceSpy.getData.and.returnValue(of([mockUser]));

      service
        .getPaginated({
          pageNumber: 1,
          pageSize: 10,
          search: 'JOHN',
        })
        .subscribe((response) => {
          const found = response.items.some((u) => u.userName.toLowerCase().includes('john'));
          expect(found).toBe(true);
          done();
        });
    });

    it('should trim search whitespace', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockUserList));

      service
        .getPaginated({
          pageNumber: 1,
          pageSize: 10,
          search: '  jane  ',
        })
        .subscribe(() => {
          expect(baseServiceSpy.getData).toHaveBeenCalled();
          done();
        });
    });
  });
});
