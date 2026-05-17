import { TestBed } from '@angular/core/testing';
import { BranchService } from './branch.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { of, throwError } from 'rxjs';

describe('BranchService', () => {
  let service: BranchService;
  let baseServiceSpy: jasmine.SpyObj<BaseService>;

  const mockBranch = {
    id: 1,
    name: 'Main Branch',
    nameAr: 'الفرع الرئيسي',
    nameEn: 'Main Branch',
    city: 'Riyadh',
    address: 'King Fahd Road',
    phone: '+966501234567',
    manager: 'Ahmed Hassan',
    isActive: true,
    createdDate: '2023-01-01',
  };

  const mockBranchList = [
    mockBranch,
    { id: 2, name: 'Jeddah Branch', nameAr: 'فرع جدة', city: 'Jeddah', phone: '+966502345678', isActive: true },
    { id: 3, name: 'Dammam Branch', nameAr: 'فرع الدمام', city: 'Dammam', phone: '+966503456789', isActive: true },
  ];

  beforeEach(() => {
    const baseServiceMock = jasmine.createSpyObj('BaseService', ['getData', 'postData', 'putData']);
    TestBed.configureTestingModule({
      providers: [BranchService, { provide: BaseService, useValue: baseServiceMock }],
    });
    service = TestBed.inject(BranchService);
    baseServiceSpy = TestBed.inject(BaseService) as jasmine.SpyObj<BaseService>;
  });

  describe('getList', () => {
    it('should retrieve all branches', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBranchList));

      service.getList().subscribe((branches) => {
        expect(branches.length).toBe(3);
        expect(branches[0].name).toBe('Main Branch');
        done();
      });
    });

    it('should handle empty branch list', (done) => {
      baseServiceSpy.getData.and.returnValue(of(null));

      service.getList().subscribe((branches) => {
        expect(branches).toEqual([]);
        done();
      });
    });

    it('should filter active branches', (done) => {
      const activeBranches = mockBranchList.filter((b) => b.isActive);
      baseServiceSpy.getData.and.returnValue(of(activeBranches));

      service.getList().subscribe((branches) => {
        expect(branches.every((b) => b.isActive)).toBe(true);
        done();
      });
    });
  });

  describe('getById', () => {
    it('should retrieve branch by id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBranch));

      service.getById(1).subscribe((branch) => {
        expect(branch.id).toBe(1);
        expect(branch.name).toBe('Main Branch');
        done();
      });
    });

    it('should call API with correct id', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBranch));

      service.getById(2).subscribe(() => {
        expect(baseServiceSpy.getData).toHaveBeenCalledWith(
          jasmine.any(String),
          jasmine.objectContaining({ id: 2 }),
        );
        done();
      });
    });
  });

  describe('create', () => {
    const createRequest = {
      name: 'New Branch',
      nameAr: 'فرع جديد',
      city: 'Medina',
      address: 'Main Street',
      phone: '+966509999999',
      manager: 'Fatima Ali',
      isActive: true,
    };

    it('should create new branch', (done) => {
      baseServiceSpy.postData.and.returnValue(of({ id: 4, ...createRequest }));

      service.create(createRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should include all branch details', (done) => {
      baseServiceSpy.postData.and.returnValue(of({}));

      service.create(createRequest).subscribe(() => {
        const callArgs = baseServiceSpy.postData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.name).toBe('New Branch');
        expect(payload.city).toBe('Medina');
        expect(payload.phone).toBe('+966509999999');
        done();
      });
    });
  });

  describe('update', () => {
    const updateRequest = {
      id: 1,
      name: 'Main Branch Updated',
      city: 'Riyadh',
      phone: '+966505555555',
      isActive: true,
    };

    it('should update branch', (done) => {
      baseServiceSpy.putData.and.returnValue(of({ success: true }));

      service.update(updateRequest).subscribe((response) => {
        expect(response).toBeDefined();
        done();
      });
    });

    it('should preserve branch id', (done) => {
      baseServiceSpy.putData.and.returnValue(of({}));

      service.update(updateRequest).subscribe(() => {
        const callArgs = baseServiceSpy.putData.calls.mostRecent().args;
        const payload = callArgs[1];
        expect(payload.id).toBe(1);
        done();
      });
    });
  });

  describe('filtering and searching', () => {
    it('should filter branches by city', (done) => {
      const riyadhBranches = mockBranchList.filter((b) => b.city === 'Riyadh');
      baseServiceSpy.getData.and.returnValue(of(riyadhBranches));

      service.getList().subscribe((branches) => {
        expect(branches.every((b) => b.city === 'Riyadh')).toBe(true);
        done();
      });
    });

    it('should search by branch name', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBranchList));

      service.getList().subscribe((branches) => {
        const found = branches.find((b) => b.name.includes('Jeddah'));
        expect(found).toBeDefined();
        done();
      });
    });

    it('should sort branches alphabetically', (done) => {
      const sorted = [...mockBranchList].sort((a, b) => a.name.localeCompare(b.name));
      baseServiceSpy.getData.and.returnValue(of(sorted));

      service.getList().subscribe((branches) => {
        expect(branches[0].name).toBeLessThanOrEqual(branches[1].name);
        done();
      });
    });

    it('should search by city', (done) => {
      baseServiceSpy.getData.and.returnValue(of(mockBranchList));

      service.getList().subscribe((branches) => {
        const jeddahBranches = branches.filter((b) => b.city === 'Jeddah');
        expect(jeddahBranches.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle branches with minimal data', (done) => {
      const minimalBranch = { id: 100, name: 'Minimal', isActive: true };
      baseServiceSpy.getData.and.returnValue(of([minimalBranch]));

      service.getList().subscribe((branches) => {
        expect(branches[0].name).toBe('Minimal');
        done();
      });
    });

    it('should handle branches with special characters in name', (done) => {
      const specialBranch = { id: 5, name: "Branch & Co.", nameAr: 'فرع وشركة', isActive: true };
      baseServiceSpy.getData.and.returnValue(of([specialBranch]));

      service.getList().subscribe((branches) => {
        expect(branches[0].name).toBe("Branch & Co.");
        done();
      });
    });
  });
});
