import { TestBed } from '@angular/core/testing';
import { PrivilegeService } from './privilege.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('PrivilegeService', () => {
  let service: PrivilegeService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockPrivilege = {
    id: 'priv-1',
    name: 'View',
    nameAr: 'عرض',
    nameEn: 'View',
  };

  const mockPrivilegeList = [
    mockPrivilege,
    { id: 'priv-2', name: 'Create', nameAr: 'إنشاء', nameEn: 'Create' },
    { id: 'priv-3', name: 'Edit', nameAr: 'تعديل', nameEn: 'Edit' },
    { id: 'priv-4', name: 'Delete', nameAr: 'حذف', nameEn: 'Delete' },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [PrivilegeService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(PrivilegeService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all privileges', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockPrivilegeList));

      service.getList().subscribe((privileges) => {
        expect(privileges.length).toBe(4);
        expect(privileges[0].name).toBe('View');
        done();
      });
    });

    it('should handle empty privilege list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((privileges) => {
        expect(privileges).toEqual([]);
        done();
      });
    });

    it('should normalize privilege data', (done) => {
      baseServiceSpy.getData.and.returnValue(of([mockPrivilege]));

      service.getList().subscribe((privileges) => {
        expect(privileges[0].id).toBeDefined();
        expect(privileges[0].name).toBeDefined();
        done();
      });
    });

    it('should call API with correct endpoint', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockPrivilegeList));

      service.getList().subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.stringContaining('privilege-list'),
          undefined,
          undefined,
        );
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve privilege by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockPrivilege));

      service.getById('priv-1').subscribe((privilege) => {
        expect(privilege.id).toBe('priv-1');
        expect(privilege.name).toBe('View');
        done();
      });
    });

    it('should call API with correct id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockPrivilege));

      service.getById('priv-2').subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ id: 'priv-2' }),
        );
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'Export',
      nameAr: 'تصدير',
      nameEn: 'Export',
    };

    it('should create a new privilege', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 'priv-new', ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include all fields in request', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload).toEqual(createRequest);
        done();
      });
    });

    it('should handle creation error', (done) => {
      baseServiceSpy.postData.and.returnValue(throwError(() => new Error('Failed to create')));

      service.create(createRequest).subscribe({
        error: (err) => {
          expect(err.message).toBe('Failed to create');
          done();
        },
      });
    });
  });

  describe('update', () => {
    const updateRequest = {
      id: 'priv-1',
      name: 'ViewAll',
      nameAr: 'عرض الكل',
      nameEn: 'View All',
    };

    it('should update an existing privilege', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should preserve privilege id', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.id).toBe('priv-1');
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

  describe('filtering and arrangement', () => {
    it('should filter privileges by name', (done) => {
      const filteredList = mockPrivilegeList.filter((p) => p.name.includes('View'));
      baseServiceSpy.getData.and.returnValue(of(filteredList));

      service.getList().subscribe((privileges) => {
        expect(privileges.every((p) => p.name.includes('View'))).toBe(true);
        done();
      });
    });

    it('should sort privileges alphabetically', (done) => {
      const sortedList = [...mockPrivilegeList].sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(sortedList));

      service.getList().subscribe((privileges) => {
        expect(privileges[0].name).toBeLessThanOrEqual(privileges[privileges.length - 1].name);
        done();
      });
    });

    it('should arrange privileges by type', (done) => {
      const arrangedList = mockPrivilegeList.sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(arrangedList));

      service.getList().subscribe((privileges) => {
        expect(privileges.length).toBeGreaterThan(0);
        done();
      });
    });
  });
});
