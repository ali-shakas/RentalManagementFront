import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleFormComponent } from './role-form.component';
import { RoleService } from '../../../services/roles/role.service';
import { PrivilegeService } from '../../../services/privileges/privilege.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('RoleFormComponent', () => {
  let component: RoleFormComponent;
  let fixture: ComponentFixture<RoleFormComponent>;
  let roleServiceSpy: jasmine.SpyObj<RoleService>;
  let privilegeServiceSpy: jasmine.SpyObj<PrivilegeService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

  const mockPrivileges = [
    { id: 'priv-1', name: 'View', nameEn: 'View' },
    { id: 'priv-2', name: 'Create', nameEn: 'Create' },
    { id: 'priv-3', name: 'Edit', nameEn: 'Edit' },
    { id: 'priv-4', name: 'Delete', nameEn: 'Delete' },
  ];

  const mockRole = {
    id: 'role-1',
    name: 'Admin',
    displayName: 'مسؤول',
    displayNameEn: 'Administrator',
    privilegeTypeIds: ['priv-1', 'priv-2'],
  };

  beforeEach(async () => {
    const roleServiceMock = jasmine.createSpyObj('RoleService', ['getById', 'create', 'update']);
    const privilegeServiceMock = jasmine.createSpyObj('PrivilegeService', ['getList']);
    const toastServiceMock = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const translateServiceMock = jasmine.createSpyObj('TranslateService', ['instant']);
    const activatedRouteMock = {
      snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue(null) } },
    };

    await TestBed.configureTestingModule({
      imports: [RoleFormComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: RoleService, useValue: roleServiceMock },
        { provide: PrivilegeService, useValue: privilegeServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormComponent);
    component = fixture.componentInstance;
    roleServiceSpy = TestBed.inject(RoleService) as jasmine.SpyObj<RoleService>;
    privilegeServiceSpy = TestBed.inject(PrivilegeService) as jasmine.SpyObj<PrivilegeService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should load privileges on init', (done) => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));

      fixture.detectChanges();

      setTimeout(() => {
        expect(privilegeServiceSpy.getList).toHaveBeenCalled();
        expect(component.privileges().length).toBe(4);
        done();
      }, 100);
    });

    it('should initialize form with empty values for create mode', (done) => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));

      fixture.detectChanges();

      setTimeout(() => {
        expect(component.isEdit()).toBe(false);
        expect(component.form.controls.name.value).toBe('');
        done();
      }, 100);
    });

    it('should load role data in edit mode', (done) => {
      (activatedRouteSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue('role-1');
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      roleServiceSpy.getById.and.returnValue(of(mockRole as any));

      fixture.detectChanges();

      setTimeout(() => {
        expect(component.isEdit()).toBe(true);
        expect(component.roleId()).toBe('role-1');
        expect(roleServiceSpy.getById).toHaveBeenCalledWith('role-1');
        done();
      }, 100);
    });
  });

  describe('privilege selection', () => {
    it('should toggle privilege selection', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));

      fixture.detectChanges();

      component.togglePrivilege('priv-1');

      expect(component.isPrivilegeSelected('priv-1')).toBe(true);
    });

    it('should unselect privilege', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.togglePrivilege('priv-1');
      expect(component.isPrivilegeSelected('priv-1')).toBe(true);

      component.togglePrivilege('priv-1');
      expect(component.isPrivilegeSelected('priv-1')).toBe(false);
    });

    it('should select all filtered privileges', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.selectAllFiltered();

      expect(component.selectedPrivilegesCount()).toBe(4);
    });

    it('should clear selected privileges', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.selectAllFiltered();
      expect(component.selectedPrivilegesCount()).toBeGreaterThan(0);

      component.clearSelectedPrivileges();
      expect(component.selectedPrivilegesCount()).toBe(0);
    });

    it('should count selected privileges', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.togglePrivilege('priv-1');
      component.togglePrivilege('priv-2');

      expect(component.selectedPrivilegesCount()).toBe(2);
    });
  });

  describe('privilege filtering', () => {
    it('should filter privileges by search term', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.privilegeSearch.set('view');

      const filtered = component.filteredPrivileges();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('View');
    });

    it('should show all privileges when search is empty', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.privilegeSearch.set('');

      expect(component.filteredPrivileges().length).toBe(4);
    });

    it('should perform case-insensitive search', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.privilegeSearch.set('CREATE');

      const filtered = component.filteredPrivileges();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Create');
    });
  });

  describe('form validation', () => {
    it('should require name field', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      const nameControl = component.form.controls.name;
      nameControl.setValue('');
      expect(nameControl.hasError('required')).toBe(true);
    });

    it('should validate name max length', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      const nameControl = component.form.controls.name;
      nameControl.setValue('a'.repeat(256));
      expect(nameControl.hasError('maxlength')).toBe(true);
    });

    it('should validate Arabic name', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      const displayNameControl = component.form.controls.displayName;
      displayNameControl.setValue('مسؤول');
      expect(displayNameControl.valid).toBe(true);
    });

    it('should validate English name', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      const displayNameEnControl = component.form.controls.displayNameEn;
      displayNameEnControl.setValue('Administrator');
      expect(displayNameEnControl.valid).toBe(true);
    });

    it('should require privilege selection', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      const privilegesControl = component.form.controls.privilegeTypeIds;
      privilegesControl.setValue([]);
      expect(privilegesControl.hasError('required')).toBe(true);
    });
  });

  describe('form submission', () => {
    it('should create new role', (done) => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      roleServiceSpy.create.and.returnValue(of({}));
      translateServiceSpy.instant.and.returnValue('Role created');

      fixture.detectChanges();

      component.form.patchValue({
        name: 'NewRole',
        displayName: 'دور جديد',
        displayNameEn: 'New Role',
        privilegeTypeIds: ['priv-1'],
      });

      component.save();

      setTimeout(() => {
        expect(roleServiceSpy.create).toHaveBeenCalled();
        expect(toastServiceSpy.success).toHaveBeenCalledWith('Role created');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/roles']);
        done();
      }, 100);
    });

    it('should update existing role', (done) => {
      (activatedRouteSpy.snapshot.paramMap.get as jasmine.Spy).and.returnValue('role-1');
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      roleServiceSpy.getById.and.returnValue(of(mockRole as any));
      roleServiceSpy.update.and.returnValue(of({}));
      translateServiceSpy.instant.and.returnValue('Role updated');

      fixture.detectChanges();

      setTimeout(() => {
        component.form.patchValue({
          name: 'UpdatedRole',
          displayName: 'دور محدث',
          displayNameEn: 'Updated Role',
          privilegeTypeIds: ['priv-1', 'priv-2'],
        });

        component.save();

        setTimeout(() => {
          expect(roleServiceSpy.update).toHaveBeenCalled();
          expect(toastServiceSpy.success).toHaveBeenCalledWith('Role updated');
          done();
        }, 100);
      }, 100);
    });

    it('should not save invalid form', () => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      fixture.detectChanges();

      component.form.patchValue({
        name: '',
        displayName: '',
        displayNameEn: '',
        privilegeTypeIds: [],
      });

      component.save();

      expect(roleServiceSpy.create).not.toHaveBeenCalled();
      expect(roleServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should handle save error', (done) => {
      privilegeServiceSpy.getList.and.returnValue(of(mockPrivileges));
      roleServiceSpy.create.and.returnValue(throwError(() => new Error('Save failed')));
      fixture.detectChanges();

      component.form.patchValue({
        name: 'NewRole',
        displayName: 'دور جديد',
        displayNameEn: 'New Role',
        privilegeTypeIds: ['priv-1'],
      });

      component.save();

      setTimeout(() => {
        expect(component.loading()).toBe(false);
        done();
      }, 100);
    });
  });
});
