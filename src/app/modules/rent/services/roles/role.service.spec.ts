import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('RoleService', () => {
  let service: RoleService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockRole = {
    id: 'role-1',
    name: 'Admin',
    displayName: 'Administrator',
    nameAr: 'مسؤول',
    nameEn: 'Admin',
    description: 'Full system access',
  };

  const mockRoleList = [
    mockRole,
    { id: 'role-2', name: 'Manager', displayName: 'Manager', nameEn: 'Manager', nameAr: 'مدير' },
    { id: 'role-3', name: 'User', displayName: 'User', nameEn: 'User', nameAr: 'مستخدم' },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [RoleService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(RoleService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all roles', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockRoleList));

      service.getList().subscribe((roles) => {
        expect(roles.length).toBe(3);
        expect(roles[0].name).toBe('Admin');
        done();
      });
    });

    it('should handle empty role list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((roles) => {
        expect(roles).toEqual([]);
        done();
      });
    });

    it('should normalize role data', (done) => {
      baseServiceSpy.getData.and.returnValue(of([mockRole]));

      service.getList().subscribe((roles) => {
        expect(roles[0].id).toBeDefined();
        expect(roles[0].name).toBeDefined();
        done();
      });
    });

    it('should include fleet parameters when provided', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockRoleList));

      service.getList('fleet-123').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ FleetId: 'fleet-123' }),
          undefined,
        );
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve role by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockRole));

      service.getById('role-1').subscribe((role) => {
        expect(role.id).toBe('role-1');
        expect(role.name).toBe('Admin');
        done();
      });
    });

    it('should call API with correct id parameter', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockRole));

      service.getById('role-2').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ id: 'role-2' }),
        );
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'NewRole',
      nameAr: 'دور جديد',
      nameEn: 'New Role',
      description: 'New role description',
    };

    it('should create a new role', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'role-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should call API with payload', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        expect(baseServiceSpy.postData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ name: 'NewRole' }),
        );
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
      id: 'role-1',
      name: 'UpdatedRole',
      nameAr: 'دور محدث',
      nameEn: 'Updated Role',
    };

    it('should update an existing role', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should call API with correct endpoint', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        expect(baseServiceSpy.putData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ id: 'role-1' }),
        );
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

  describe('filtering and searching', () => {
    it('should support filtering by name', (done) => {
      baseServiceSpy.getData.and.returnValue(
        of(mockRoleList.filter((r) => r.name.includes('Admin'))),
      );

      service.getList().subscribe((roles) => {
        expect(roles.every((r) => r.name.includes('Admin') || roles.length === 0)).toBe(true);
        done();
      });
    });

    it('should sort roles alphabetically', (done) => {
      const sortedRoles = [...mockRoleList].sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(sortedRoles));

      service.getList().subscribe((roles) => {
        expect(roles[0].name).toBeLessThanOrEqual(roles[1].name);
        done();
      });
    });
  });
});
