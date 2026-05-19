import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BranchService } from '../../../../rent/services/branches/branch.service';
import { CustomerService } from '../../../../rent/services/customers/customer.service';
import { VehicleService } from '../../../../rent/services/vehicles/vehicle.service';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';
import { FinancialYearService } from '../../../services/financial-years/financial-year.service';
import { JournalEntryService } from '../../../services/journals/journal-entry.service';
import { JournalEntryFormComponent } from '../../journals/journal-entry-form/journal-entry-form.component';

describe('JournalEntryFormComponent', () => {
  let fixture: ComponentFixture<JournalEntryFormComponent>;
  let component: JournalEntryFormComponent;
  let journalServiceSpy: jasmine.SpyObj<JournalEntryService>;
  let countingServiceSpy: jasmine.SpyObj<CountingEntryService>;
  let financialYearServiceSpy: jasmine.SpyObj<FinancialYearService>;
  let branchServiceSpy: jasmine.SpyObj<BranchService>;
  let customerServiceSpy: jasmine.SpyObj<CustomerService>;
  let vehicleServiceSpy: jasmine.SpyObj<VehicleService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const fleetId = '11111111-0000-0000-0000-000000000001';
  const financialYearId = '77777777-0000-0000-0000-000000000401';

  function configure(options: {
    routeId?: string | null;
    viewMode?: boolean;
    createResponse?: Observable<unknown>;
    accounts?: any[];
    financialYears?: any[];
    branches?: any[];
    customers?: any[];
    vehicles?: any[];
    detailsResponse?: Observable<{ entry: any; details: Array<Record<string, unknown>> }>;
  } = {}): void {
    journalServiceSpy = jasmine.createSpyObj<JournalEntryService>('JournalEntryService', [
      'create',
      'getByIdWithDetails',
    ]);
    journalServiceSpy.create.and.returnValue(options.createResponse ?? of({ id: 'journal-created' }));
    journalServiceSpy.getByIdWithDetails.and.returnValue(options.detailsResponse ?? of({
      entry: {
        id: options.routeId ?? 'journal-1',
        date: '2026-05-19T09:30:00',
        node: 'Loaded journal',
        journalType: true,
        operationType: 2,
        status: 1,
        idFinancialYear: financialYearId,
        financialYearName: 'FY 2026',
        idBranch: 12,
        branchName: 'Main Branch',
        isSystemOperation: false,
      },
      details: [
        {
          IdCounting: 'cash-account',
          CountingName: 'Cash',
          Debtir: 150,
          Credit: 0,
          Node: 'Cash debit',
          IdCustomer: 55,
          VehiclePlatnumber: 'ABC-123',
          IdVehicle: 77,
        },
        {
          IdCounting: 'revenue-account',
          CountingName: 'Revenue',
          Debtir: 0,
          Credit: 150,
          Node: 'Revenue credit',
        },
      ],
    }));

    countingServiceSpy = jasmine.createSpyObj<CountingEntryService>('CountingEntryService', ['getList']);
    countingServiceSpy.getList.and.returnValue(of(options.accounts ?? [
      {
        id: 'cash-account',
        countingNumber: 1101,
        nameAr: 'الصندوق',
        nameEn: 'Cash',
        isActive: true,
        status: 1,
      },
      {
        id: 'revenue-account',
        countingNumber: 4101,
        nameAr: 'إيرادات التأجير',
        nameEn: 'Rental Revenue',
        isActive: true,
        status: 1,
      },
    ]));

    financialYearServiceSpy = jasmine.createSpyObj<FinancialYearService>('FinancialYearService', ['getList']);
    financialYearServiceSpy.getList.and.returnValue(of(options.financialYears ?? [
      {
        id: financialYearId,
        financialYearNumber: 2026,
        name: 'FY 2026',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        isCurrentYear: true,
      },
    ]));

    branchServiceSpy = jasmine.createSpyObj<BranchService>('BranchService', ['getList']);
    branchServiceSpy.getList.and.returnValue(of(options.branches ?? [
      { id: 12, nameAr: 'الفرع الرئيسي', nameEn: 'Main Branch', fleetId, isActive: true },
    ]));

    customerServiceSpy = jasmine.createSpyObj<CustomerService>('CustomerService', ['getList']);
    customerServiceSpy.getList.and.returnValue(of(options.customers ?? [
      {
        id: '55',
        nameAr: 'عميل اختبار',
        nameEn: 'Test Customer',
        firstMobileNumber: '0500000000',
        isActive: true,
      },
    ]));

    vehicleServiceSpy = jasmine.createSpyObj<VehicleService>('VehicleService', ['getList']);
    vehicleServiceSpy.getList.and.returnValue(of(options.vehicles ?? [
      {
        id: '77',
        make: 'Toyota',
        model: 'Camry',
        plateNumber: 'ABC-123',
        serialNumber: 'SN-77',
        status: 'Available',
        fleetId,
        isActive: true,
      },
    ]));

    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'warning', 'info']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], {
      events: of(new NavigationStart(1, '/journals/create')),
      url: '/journals/create',
    });

    TestBed.configureTestingModule({
      imports: [
        JournalEntryFormComponent,
        NoopAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: JournalEntryService, useValue: journalServiceSpy },
        { provide: CountingEntryService, useValue: countingServiceSpy },
        { provide: FinancialYearService, useValue: financialYearServiceSpy },
        { provide: BranchService, useValue: branchServiceSpy },
        { provide: CustomerService, useValue: customerServiceSpy },
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AuthStateService,
          useValue: {
            fleetId: jasmine.createSpy('fleetId').and.returnValue(fleetId),
            branchId: jasmine.createSpy('branchId').and.returnValue(12),
          },
        },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => options.routeId ?? null },
              url: options.viewMode ? [{ path: 'view' }] : [],
            },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(JournalEntryFormComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function addDraftLine(values: {
    countingId: string;
    debtir?: number | null;
    credit?: number | null;
    node?: string;
    idCustomer?: string;
    idVehicle?: string;
  }): void {
    component.detailDraft.patchValue({
      countingId: values.countingId,
      debtir: values.debtir ?? null,
      credit: values.credit ?? null,
      node: values.node ?? '',
      idCustomer: values.idCustomer ?? '',
      idVehicle: values.idVehicle ?? '',
    });
    component.addLine();
  }

  function fillHeader(): void {
    component.form.patchValue({
      date: '2026-05-19T09:00',
      node: 'Manual rental journal',
      journalType: 1,
      operationType: 1,
      status: 1,
      idFinancialYear: financialYearId,
      idBranch: 12,
    });
  }

  function fillBalancedForm(): void {
    fillHeader();
    addDraftLine({
      countingId: 'cash-account',
      debtir: 250,
      credit: null,
      node: 'Cash received',
      idCustomer: '55',
      idVehicle: '77',
    });
    addDraftLine({
      countingId: 'revenue-account',
      debtir: null,
      credit: 250,
      node: 'Rental revenue',
    });
  }

  it('creates the component without errors', () => {
    configure();

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('initializes the form with journal header fields and details FormArray', () => {
    configure();

    fixture.detectChanges();

    expect(component.form.controls.date).toBeTruthy();
    expect(component.form.controls.journalType).toBeTruthy();
    expect(component.form.controls.node).toBeTruthy();
    expect(component.form.controls.idBranch).toBeTruthy();
    expect(component.form.controls.details).toBeTruthy();
    expect(component.detailsArray.length).toBe(0);
  });

  it('keeps a writable draft detail row ready for the first line', () => {
    configure();

    fixture.detectChanges();

    expect(component.detailDraft).toBeTruthy();
    expect(component.detailDraft.controls.countingId.value).toBe('');
    expect(component.detailDraft.controls.debtir.value).toBeNull();
    expect(component.detailDraft.controls.credit.value).toBeNull();
  });

  it('adds detail rows to the FormArray from the draft line', () => {
    configure();
    fixture.detectChanges();

    addDraftLine({ countingId: 'cash-account', debtir: 100, node: 'Debit line' });
    addDraftLine({ countingId: 'revenue-account', credit: 100, node: 'Credit line' });

    expect(component.detailsArray.length).toBe(2);
    expect(component.detailsArray.at(0).value.countingId).toBe('cash-account');
    expect(component.detailsArray.at(1).value.countingId).toBe('revenue-account');
  });

  it('removes a detail row only when the minimum line count remains valid', () => {
    configure();
    fixture.detectChanges();
    fillBalancedForm();
    addDraftLine({ countingId: 'cash-account', debtir: 10, node: 'Extra line' });

    component.removeLine(2);

    expect(component.detailsArray.length).toBe(2);

    component.removeLine(1);

    expect(component.detailsArray.length).toBe(2);
    expect(toastSpy.error).toHaveBeenCalledWith('At least two lines are required');
  });

  it('validates required header and detail fields', () => {
    configure();
    fixture.detectChanges();

    component.form.patchValue({
      date: '',
      node: '',
      journalType: '',
      idBranch: 0,
      idFinancialYear: '',
    });
    component.detailDraft.patchValue({ countingId: '', debtir: 100, credit: null });
    component.detailDraft.markAllAsTouched();
    component.detailDraft.updateValueAndValidity();

    expect(component.form.controls.date.hasError('required')).toBeTrue();
    expect(component.form.controls.node.hasError('required')).toBeTrue();
    expect(component.form.controls.journalType.hasError('required')).toBeTrue();
    expect(component.form.controls.idBranch.hasError('min')).toBeTrue();
    expect(component.form.controls.idFinancialYear.hasError('required')).toBeTrue();
    expect(component.detailDraft.controls.countingId.hasError('required')).toBeTrue();
  });

  it('validates debit and credit rules for a single detail line', () => {
    configure();
    fixture.detectChanges();

    component.detailDraft.patchValue({ countingId: 'cash-account', debtir: 100, credit: 50 });
    component.detailDraft.updateValueAndValidity();

    expect(component.detailDraft.hasError('debitCreditRequired')).toBeTrue();

    component.detailDraft.patchValue({ debtir: null, credit: null });
    component.detailDraft.updateValueAndValidity();

    expect(component.detailDraft.hasError('debitCreditRequired')).toBeTrue();

    component.detailDraft.patchValue({ debtir: 100, credit: null });
    component.detailDraft.updateValueAndValidity();

    expect(component.detailDraft.valid).toBeTrue();
  });

  it('clears opposite amount when draft debit or credit is entered', () => {
    configure();
    fixture.detectChanges();

    component.detailDraft.patchValue({ debtir: 10, credit: 5 });
    component.onDraftDebitInput();

    expect(component.detailDraft.controls.credit.value).toBeNull();

    component.detailDraft.patchValue({ debtir: 10, credit: 5 });
    component.onDraftCreditInput();

    expect(component.detailDraft.controls.debtir.value).toBeNull();
  });

  it('calculates total debit, total credit, difference, and balanced state', () => {
    configure();
    fixture.detectChanges();

    fillBalancedForm();

    expect(component.totalDebit()).toBe(250);
    expect(component.totalCredit()).toBe(250);
    expect(component.difference()).toBe(0);
    expect(component.isBalanced()).toBeTrue();

    component.detailsArray.at(1).patchValue({ credit: 200 });

    expect(component.totalDebit()).toBe(250);
    expect(component.totalCredit()).toBe(200);
    expect(component.difference()).toBe(50);
    expect(component.isBalanced()).toBeFalse();
  });

  it('allows save only when lookups are loaded, the form is valid, minimum lines exist, and totals are balanced', () => {
    configure();
    fixture.detectChanges();

    expect(component.canSave()).toBeFalse();

    fillBalancedForm();

    expect(component.hasMinimumLines()).toBeTrue();
    expect(component.form.valid).toBeTrue();
    expect(component.canSave()).toBeTrue();
  });

  it('submits a valid create payload with journal header and details mapping', () => {
    configure();
    fixture.detectChanges();
    fillBalancedForm();

    component.onSubmit();

    expect(journalServiceSpy.create).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      node: 'Manual rental journal',
      journalType: true,
      debtir: 250,
      credit: 250,
      balannce: 0,
      operationType: 1,
      status: 1,
      isSystemOperation: false,
      idFinancialYear: financialYearId,
      idBranch: 12,
      fleetId,
      details: [
        jasmine.objectContaining({
          idCounting: 'cash-account',
          debtir: 250,
          credit: 0,
          balannce: 250,
          node: 'Cash received',
          status: 1,
          customerId: 55,
          idVehicle: 77,
        }),
        jasmine.objectContaining({
          idCounting: 'revenue-account',
          debtir: 0,
          credit: 250,
          balannce: -250,
          node: 'Rental revenue',
          status: 1,
          customerId: undefined,
          idVehicle: undefined,
        }),
      ],
    }));
  });

  it('prevents submit when minimum detail lines are missing', () => {
    configure();
    fixture.detectChanges();
    fillHeader();
    addDraftLine({ countingId: 'cash-account', debtir: 100 });

    component.onSubmit();

    expect(journalServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith('At least two lines are required');
  });

  it('prevents submit when the form is invalid and does not call create', () => {
    configure();
    fixture.detectChanges();
    fillBalancedForm();
    component.form.controls.node.setValue('');

    component.onSubmit();

    expect(journalServiceSpy.create).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('prevents submit when totals are not balanced', () => {
    configure();
    fixture.detectChanges();
    fillBalancedForm();
    component.detailsArray.at(1).patchValue({ credit: 200 });

    component.onSubmit();

    expect(journalServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith('Entry must be balanced before save');
  });

  it('shows success toast and navigates after API success', () => {
    configure();
    fixture.detectChanges();
    fillBalancedForm();

    component.onSubmit();

    expect(toastSpy.success).toHaveBeenCalledWith('Journal entry created successfully');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/journals']);
    expect(component.loading()).toBeFalse();
  });

  it('shows API error toast and keeps the form available on create failure', () => {
    configure({
      createResponse: throwError(() => ({
        error: { propertyErrors: { details: ['Debit and credit are not balanced'] } },
      })),
    });
    fixture.detectChanges();
    fillBalancedForm();

    component.onSubmit();

    expect(toastSpy.error).toHaveBeenCalledWith('Debit and credit are not balanced');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('loads lookup data for accounts, financial years, branches, customers, and vehicles', () => {
    configure();

    fixture.detectChanges();

    expect(countingServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(financialYearServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(branchServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(customerServiceSpy.getList).toHaveBeenCalledWith({ fleetId, isActive: true });
    expect(vehicleServiceSpy.getList).toHaveBeenCalledWith({
      fleetId,
      branchId: 12,
      status: '',
      includeEmptyStatus: true,
    });
    expect(component.accounts().length).toBe(2);
    expect(component.customers().length).toBe(1);
    expect(component.vehicles().length).toBe(1);
  });

  it('loads journal details in view mode, fills the disabled form, and does not submit', () => {
    configure({ routeId: 'journal-1', viewMode: true });

    fixture.detectChanges();

    expect(journalServiceSpy.getByIdWithDetails).toHaveBeenCalledWith('journal-1', fleetId);
    expect(component.isViewMode()).toBeTrue();
    expect(component.form.disabled).toBeTrue();
    expect(component.detailsArray.length).toBe(2);
    expect(component.viewBranchName()).toBe('Main Branch');
    expect(component.viewFinancialYearDisplay()).toBe('FY 2026');

    component.onSubmit();

    expect(journalServiceSpy.create).not.toHaveBeenCalled();
  });

  it('handles empty details in view mode without breaking the form', () => {
    configure({
      routeId: 'journal-empty',
      viewMode: true,
      detailsResponse: of({
        entry: {
          id: 'journal-empty',
          date: null,
          node: null,
          journalType: null,
          operationType: null,
          status: null,
          idFinancialYear: null,
          idBranch: null,
        },
        details: [],
      }),
    });

    fixture.detectChanges();

    expect(component.detailsArray.length).toBe(0);
    expect(component.form.disabled).toBeTrue();
    expect(component.detailAccountLabel(0)).toBe('-');
  });

  it('maps optional customer and vehicle fields to undefined when blank', () => {
    configure();
    fixture.detectChanges();
    fillHeader();
    addDraftLine({ countingId: 'cash-account', debtir: 50, idCustomer: '', idVehicle: '' });
    addDraftLine({ countingId: 'revenue-account', credit: 50 });

    component.onSubmit();

    const payload = journalServiceSpy.create.calls.mostRecent().args[0];
    expect(payload.details[0].customerId).toBeUndefined();
    expect(payload.details[0].idVehicle).toBeUndefined();
  });
});
