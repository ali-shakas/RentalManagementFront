import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BookingService } from '../../../../rent/services/booking/booking.service';
import { BranchService } from '../../../../rent/services/branches/branch.service';
import { CustomerService } from '../../../../rent/services/customers/customer.service';
import { VehicleService } from '../../../../rent/services/vehicles/vehicle.service';
import { BankService } from '../../../services/banks/bank.service';
import { CashAccountService } from '../../../services/cash/cash-account.service';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';
import { FinancialYearService } from '../../../services/financial-years/financial-year.service';
import { PaymentCountService } from '../../../services/payment-counts/payment-count.service';
import { PaymentCountFormComponent } from '../../payment-counts/payment-count-form/payment-count-form.component';

describe('PaymentCountFormComponent', () => {
  let fixture: ComponentFixture<PaymentCountFormComponent>;
  let component: PaymentCountFormComponent;
  let paymentCountServiceSpy: jasmine.SpyObj<PaymentCountService>;
  let bankServiceSpy: jasmine.SpyObj<BankService>;
  let cashAccountServiceSpy: jasmine.SpyObj<CashAccountService>;
  let countingServiceSpy: jasmine.SpyObj<CountingEntryService>;
  let financialYearServiceSpy: jasmine.SpyObj<FinancialYearService>;
  let customerServiceSpy: jasmine.SpyObj<CustomerService>;
  let vehicleServiceSpy: jasmine.SpyObj<VehicleService>;
  let branchServiceSpy: jasmine.SpyObj<BranchService>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let navigateSpy: jasmine.Spy;

  const fleetId = '11111111-0000-0000-0000-000000000001';
  const financialYearId = '77777777-0000-0000-0000-000000000401';

  function configure(options: {
    createResponse?: Observable<unknown>;
    banks?: any[];
    cashAccounts?: any[];
    accounts?: any[];
    financialYears?: any[];
    customers?: any[];
    vehicles?: any[];
    branches?: any[];
    bookings?: any[];
  } = {}): void {
    paymentCountServiceSpy = jasmine.createSpyObj<PaymentCountService>('PaymentCountService', [
      'create',
      'getLastIsPostingForBooking',
    ]);
    paymentCountServiceSpy.create.and.returnValue(options.createResponse ?? of({ id: 'voucher-created' }));
    paymentCountServiceSpy.getLastIsPostingForBooking.and.returnValue(of(false));

    bankServiceSpy = jasmine.createSpyObj<BankService>('BankService', ['getList']);
    bankServiceSpy.getList.and.returnValue(of(options.banks ?? [
      { id: 'bank-1', name: 'Main Bank', countingId: '1102', fleetId, isActive: true },
    ]));

    cashAccountServiceSpy = jasmine.createSpyObj<CashAccountService>('CashAccountService', ['getList']);
    cashAccountServiceSpy.getList.and.returnValue(of(options.cashAccounts ?? [
      { id: 'cash-1', name: 'Main Cash', countingId: '1101', fleetId, isActive: true },
    ]));

    countingServiceSpy = jasmine.createSpyObj<CountingEntryService>('CountingEntryService', ['getList']);
    countingServiceSpy.getList.and.returnValue(of(options.accounts ?? [
      {
        id: 'revenue-account',
        countingNumber: 4101,
        nameAr: 'إيرادات التأجير',
        nameEn: 'Rental Revenue',
        isActive: true,
        status: 1,
      },
      {
        id: 'expense-account',
        countingNumber: 5101,
        nameAr: 'مصروف صيانة',
        nameEn: 'Maintenance Expense',
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
        status: 'Available',
        fleetId,
        isActive: true,
      },
    ]));

    branchServiceSpy = jasmine.createSpyObj<BranchService>('BranchService', ['getList']);
    branchServiceSpy.getList.and.returnValue(of(options.branches ?? [
      { id: 12, nameAr: 'الفرع الرئيسي', nameEn: 'Main Branch', code: 'BR-1', fleetId, isActive: true },
    ]));

    bookingServiceSpy = jasmine.createSpyObj<BookingService>('BookingService', ['getList']);
    bookingServiceSpy.getList.and.returnValue(of(options.bookings ?? [
      {
        id: '101',
        bookingNumber: 'B-101',
        customerName: 'Test Customer',
        vehiclePlateNumber: 'ABC-123',
        status: 'Confirmed',
        totalAmount: 600,
      },
    ]));

    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'warning', 'info']);
    TestBed.configureTestingModule({
      imports: [
        PaymentCountFormComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: PaymentCountService, useValue: paymentCountServiceSpy },
        { provide: BankService, useValue: bankServiceSpy },
        { provide: CashAccountService, useValue: cashAccountServiceSpy },
        { provide: CountingEntryService, useValue: countingServiceSpy },
        { provide: FinancialYearService, useValue: financialYearServiceSpy },
        { provide: CustomerService, useValue: customerServiceSpy },
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: BranchService, useValue: branchServiceSpy },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AuthStateService,
          useValue: {
            fleetId: jasmine.createSpy('fleetId').and.returnValue(fleetId),
            branchId: jasmine.createSpy('branchId').and.returnValue(12),
          },
        },
      ],
    });

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(PaymentCountFormComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function addDetail(idCounting = 'revenue-account', price = 250, node = 'Voucher detail'): void {
    component.detailDraft.patchValue({ idCounting, price, node });
    component.addLine();
  }

  function fillBaseForm(overrides: Record<string, unknown> = {}): void {
    component.form.patchValue({
      idCustomer: '55',
      idVehicle: '77',
      idBooking: '',
      idBranch: 12,
      paid: 250,
      paymentType: 1,
      bondType: 2,
      status: 1,
      idCash: 'cash-1',
      idBank: '',
      dscription: 'سند قبض اختبار',
      idFinancialYear: financialYearId,
      ...overrides,
    });
  }

  it('creates the component without errors', () => {
    configure();

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('initializes the form with core voucher fields and details FormArray', () => {
    configure();

    fixture.detectChanges();

    expect(component.form.controls.bondType).toBeTruthy();
    expect(component.form.controls.paymentType).toBeTruthy();
    expect(component.form.controls.paid).toBeTruthy();
    expect(component.form.controls.idBranch).toBeTruthy();
    expect(component.form.controls.idBooking).toBeTruthy();
    expect(component.form.controls.idCash).toBeTruthy();
    expect(component.form.controls.idBank).toBeTruthy();
    expect(component.form.controls.dscription).toBeTruthy();
    expect(component.form.controls.details).toBeTruthy();
    expect(component.detailsArray.length).toBe(0);
  });

  it('validates required fields and positive amount', () => {
    configure();
    fixture.detectChanges();

    component.form.patchValue({
      paid: null,
      paymentType: '' as any,
      bondType: '' as any,
      idBranch: '' as any,
      dscription: '',
      idFinancialYear: '',
    });
    component.form.markAllAsTouched();
    component.form.updateValueAndValidity();

    expect(component.form.controls.paid.invalid).toBeTrue();
    expect(component.form.controls.paymentType.hasError('required')).toBeTrue();
    expect(component.form.controls.bondType.hasError('required')).toBeTrue();
    expect(component.form.controls.idBranch.hasError('required')).toBeTrue();
    expect(component.form.controls.dscription.hasError('required')).toBeTrue();
    expect(component.form.controls.idFinancialYear.hasError('required')).toBeTrue();

    component.form.controls.paid.setValue(0);
    expect(component.form.controls.paid.invalid).toBeTrue();
  });

  it('creates a receipt voucher with correct bond type and amount mapping', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ bondType: 2, paymentType: 1, paid: 300, idCash: 'cash-1' });
    addDetail('revenue-account', 300, 'Rental receipt');

    component.onSubmit();

    expect(paymentCountServiceSpy.create).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      paid: 300,
      bondType: 2,
      paymentType: 1,
      idCash: 'cash-1',
      idBank: undefined,
      paidCash: 300,
      paidBank: 0,
      fleetId,
    }));
  });

  it('creates a payment voucher with expense category mapping', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({
      bondType: 1,
      paymentType: 1,
      paid: 180,
      idCash: 'cash-1',
      expenseCategory: 1,
      dscription: 'Vehicle maintenance payment',
    });
    addDetail('expense-account', 180, 'Maintenance expense');

    component.onSubmit();

    expect(paymentCountServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      paid: 180,
      bondType: 1,
      paymentType: 1,
      expenseCategory: 1,
    }));
  });

  it('requires expense category for payment vouchers', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ bondType: 1, paymentType: 1, paid: 180, idCash: 'cash-1', expenseCategory: '' });
    addDetail('expense-account', 180);

    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith('Expense category is required for payment voucher');
  });

  it('maps cash payment to cash account and does not send bank id', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paymentType: 1, paid: 125, idCash: 'cash-1', idBank: 'bank-1' });
    addDetail('revenue-account', 125);

    component.onSubmit();

    const payload = paymentCountServiceSpy.create.calls.mostRecent().args[0];
    expect(payload.idCash).toBe('cash-1');
    expect(payload.idBank).toBeUndefined();
    expect(payload.paidCash).toBe(125);
    expect(payload.paidBank).toBe(0);
  });

  it('maps bank payment to bank account and does not send cash id', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paymentType: 4, paid: 210, idCash: 'cash-1', idBank: 'bank-1' });
    addDetail('revenue-account', 210);

    component.onSubmit();

    const payload = paymentCountServiceSpy.create.calls.mostRecent().args[0];
    expect(payload.idCash).toBeUndefined();
    expect(payload.idBank).toBe('bank-1');
    expect(payload.paidCash).toBe(0);
    expect(payload.paidBank).toBe(210);
  });

  it('maps mixed bank/cash payments with split amounts', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paymentType: 5, paid: 500, idCash: 'cash-1', idBank: 'bank-1' });
    component.form.controls.paidCash.setValue(200);
    component.form.controls.paidBank.setValue(300);
    addDetail('revenue-account', 500);

    component.onSubmit();

    expect(paymentCountServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      paymentType: 5,
      idCash: 'cash-1',
      idBank: 'bank-1',
      paidCash: 200,
      paidBank: 300,
    }));
  });

  it('requires at least one account for confirmed mixed payments', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paymentType: 5, paid: 500, idCash: '', idBank: '' });
    component.form.controls.paidCash.setValue(200);
    component.form.controls.paidBank.setValue(300);
    addDetail('revenue-account', 500);

    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith(
      'For confirmed bank/cash payments, choose at least one account (cash or bank).',
    );
  });

  it('maps booking-linked payment and booking status only when booking is selected', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ idBooking: '101', stutusbooking: 2, paid: 260, paymentType: 1, idCash: 'cash-1' });
    addDetail('revenue-account', 260);

    component.onSubmit();

    expect(paymentCountServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      idBooking: 101,
      stutusbooking: 2,
    }));
  });

  it('handles null booking as optional and disables booking status', () => {
    configure({ bookings: [] });
    fixture.detectChanges();
    fillBaseForm({ idBooking: '', paid: 90, paymentType: 1, idCash: 'cash-1' });
    addDetail('revenue-account', 90);

    component.onSubmit();

    const payload = paymentCountServiceSpy.create.calls.mostRecent().args[0];
    expect(payload.idBooking).toBeUndefined();
    expect(payload.stutusbooking).toBeUndefined();
    expect(component.form.controls.stutusbooking.disabled).toBeTrue();
  });

  it('adds, removes, totals, and balances detail lines', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paid: 300 });

    addDetail('revenue-account', 200, 'First');
    addDetail('expense-account', 100, 'Second');

    expect(component.detailsArray.length).toBe(2);
    expect(component.totalDetails()).toBe(300);
    expect(component.detailsDifference()).toBe(0);
    expect(component.isDetailsBalanced()).toBeTrue();

    component.removeLine(1);

    expect(component.detailsArray.length).toBe(1);
    expect(component.totalDetails()).toBe(200);
  });

  it('prevents removing the final detail line', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm();
    addDetail('revenue-account', 250);

    component.removeLine(0);

    expect(component.detailsArray.length).toBe(1);
    expect(toastSpy.error).toHaveBeenCalledWith('At least one line is required');
  });

  it('maps detail lines inside create payload', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paid: 250, idCash: 'cash-1' });
    addDetail('revenue-account', 250, 'إيراد تأجير');

    component.onSubmit();

    expect(paymentCountServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      details: [
        jasmine.objectContaining({
          idCounting: 'revenue-account',
          price: 250,
          node: 'إيراد تأجير',
          idBranch: 12,
          idFinancialYear: financialYearId,
        }),
      ],
    }));
  });

  it('prevents submit when no detail line exists', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paid: 250 });

    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith('At least one detail line is required');
  });

  it('prevents submit when details total does not equal paid amount', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paid: 250 });
    addDetail('revenue-account', 200);

    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith('Details total must equal paid amount');
  });

  it('prevents submit when the form is invalid', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paid: 250, dscription: '' });
    addDetail('revenue-account', 250);

    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('shows success toast and navigates after create success', () => {
    configure();
    fixture.detectChanges();
    fillBaseForm({ paid: 250, idCash: 'cash-1' });
    addDetail('revenue-account', 250);

    component.onSubmit();

    expect(toastSpy.success).toHaveBeenCalledWith('Payment count created successfully');
    expect(navigateSpy).toHaveBeenCalledWith(['/payment-counts']);
    expect(component.loading()).toBeFalse();
  });

  it('shows API error and keeps the form available on create failure', () => {
    configure({ createResponse: throwError(() => new Error('Paymentcount: backend validation failed')) });
    fixture.detectChanges();
    fillBaseForm({ paid: 250, idCash: 'cash-1' });
    addDetail('revenue-account', 250);

    component.onSubmit();

    expect(toastSpy.error).toHaveBeenCalledWith('backend validation failed');
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('loads lookups for channels, accounts, financial years, customers, vehicles, branches, and bookings', () => {
    configure();

    fixture.detectChanges();

    expect(bankServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(cashAccountServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(countingServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(financialYearServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(customerServiceSpy.getList).toHaveBeenCalledWith({ fleetId, isActive: true });
    expect(branchServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(bookingServiceSpy.getList).toHaveBeenCalledWith({ fleetId, branchId: 12 });
    expect(vehicleServiceSpy.getList).toHaveBeenCalled();
    expect(component.banks().length).toBe(1);
    expect(component.cashAccounts().length).toBe(1);
    expect(component.accounts().length).toBe(2);
    expect(component.bookings().length).toBe(1);
  });

  it('falls back to unscoped channel lookups when fleet channels are empty', () => {
    configure({ banks: [], cashAccounts: [] });

    fixture.detectChanges();

    expect(bankServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(bankServiceSpy.getList).toHaveBeenCalledWith(null);
    expect(cashAccountServiceSpy.getList).toHaveBeenCalledWith(fleetId);
    expect(cashAccountServiceSpy.getList).toHaveBeenCalledWith(null);
  });

  it('handles edge cases: zero, negative, missing account, and Arabic note', () => {
    configure();
    fixture.detectChanges();

    fillBaseForm({ paid: 0, dscription: 'ملاحظة عربية', paymentType: 1, idCash: 'cash-1' });
    addDetail('revenue-account', 0, 'تفصيل عربي');
    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith('Amount must be greater than zero');

    component.detailsArray.clear();
    component.form.controls.paid.setValue(-10);
    addDetail('', -10, 'Invalid');
    component.onSubmit();

    expect(paymentCountServiceSpy.create).not.toHaveBeenCalled();
  });
});
