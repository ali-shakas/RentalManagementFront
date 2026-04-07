import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, of, startWith } from 'rxjs';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import {
  SmoothSelectComponent,
  SmoothSelectOption,
} from '../../../../../shared/ui/smooth-select/smooth-select.component';
import {
  CoreCountingAccountTemplate,
  VoucherAccountingPurpose,
  VoucherCollectionChannel,
  resolveVoucherFlow,
} from '../../../common/finance-accounting-blueprints';
import { Bank } from '../../../models/banks/bank.model';
import { CashAccount } from '../../../models/cash/cash-account.model';
import { CreatePaymentCountRequest } from '../../../models/payment-counts/payment-count.model';
import { BankService } from '../../../services/banks/bank.service';
import { CashAccountService } from '../../../services/cash/cash-account.service';
import { PaymentCountService } from '../../../services/payment-counts/payment-count.service';

@Component({
  selector: 'app-payment-count-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    SmoothSelectComponent,
  ],
  templateUrl: './payment-count-form.component.html',
})
export class PaymentCountFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authState = inject(AuthStateService);
  private paymentCountService = inject(PaymentCountService);
  private bankService = inject(BankService);
  private cashService = inject(CashAccountService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  loadingChannels = signal(false);
  banks = signal<Bank[]>([]);
  cashAccounts = signal<CashAccount[]>([]);
  paymentTypeValue = signal(1);
  statusValue = signal(1);

  readonly cashOptions = computed<SmoothSelectOption[]>(() => [
    { label: 'Select cash account', value: '' },
    ...this.cashAccounts().map(item => ({
      label: this.formatCashLabel(item),
      value: item.id,
    })),
  ]);

  readonly bankOptions = computed<SmoothSelectOption[]>(() => [
    { label: 'Select bank account', value: '' },
    ...this.banks().map(item => ({
      label: this.formatBankLabel(item),
      value: item.id,
    })),
  ]);

  readonly paymentTypeOptions: SmoothSelectOption[] = [
    { label: 'Cash', value: 1 },
    { label: 'Network/POS', value: 2 },
    { label: 'Cheque', value: 3 },
    { label: 'Bank Transfer', value: 4 },
    { label: 'Bank/Cash', value: 5 },
  ];

  readonly bondTypeOptions: SmoothSelectOption[] = [
    { label: 'Receipt Voucher', value: 1 },
    { label: 'Payment Voucher', value: 2 },
  ];

  readonly statusOptions: SmoothSelectOption[] = [
    { label: 'Confirmed', value: 1 },
    { label: 'Pending', value: 2 },
  ];

  readonly accountingPurposeOptions: SmoothSelectOption[] = [
    { label: 'Rental Revenue Collection', value: 'rental_revenue' },
    { label: 'Customer Booking Advance', value: 'booking_advance' },
    { label: 'Customer Security Deposit Received', value: 'security_deposit' },
    { label: 'Customer Security Deposit Refund', value: 'security_refund' },
    { label: 'Late Fee Recognition', value: 'late_fee' },
    { label: 'Damage Fee Recognition', value: 'damage_fee' },
  ];

  form = this.fb.group({
    idCustomer: [0, [Validators.required, Validators.min(1)]],
    paid: [0, [Validators.required, Validators.min(0)]],
    dscription: ['', [Validators.required, Validators.maxLength(500)]],
    idVehicle: [0, [Validators.required, Validators.min(1)]],
    idBranch: [Number(this.authState.branchId() ?? 0), [Validators.required, Validators.min(1)]],
    paymentType: [1, [Validators.required, Validators.min(1)]],
    bondType: [1, [Validators.required, Validators.min(1)]],
    status: [1, [Validators.required, Validators.min(1)]],
    accountingPurpose: ['rental_revenue' as VoucherAccountingPurpose, [Validators.required]],
    idCash: [''],
    idBank: [''],
    paidCash: [0, [Validators.required, Validators.min(0)]],
    paidBank: [0, [Validators.required, Validators.min(0)]],
    idBooking: [0, [Validators.required, Validators.min(1)]],
    stutusbooking: [0, [Validators.required, Validators.min(0)]],
    fleetId: ['', [Validators.required]],
  });

  readonly selectedCollectionChannel = computed<VoucherCollectionChannel>(() =>
    Number(this.form.controls.paymentType.value) === 1 ? 'cash' : 'bank',
  );

  readonly suggestedVoucherFlow = computed(() =>
    resolveVoucherFlow(this.form.controls.accountingPurpose.value, this.selectedCollectionChannel()),
  );

  ngOnInit(): void {
    this.form.controls.fleetId.setValue(this.authState.fleetId() ?? '');
    this.form.controls.paymentType.valueChanges
      .pipe(startWith(this.form.controls.paymentType.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.paymentTypeValue.set(Number(value ?? 1));
        this.applyBusinessRules();
      });
    this.form.controls.status.valueChanges
      .pipe(startWith(this.form.controls.status.value), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.statusValue.set(Number(value ?? 1));
        this.applyBusinessRules();
      });

    this.loadChannels();
  }

  onSubmit(): void {
    const paymentType = Number(this.form.controls.paymentType.value ?? 1);
    const status = Number(this.form.controls.status.value ?? 1);
    const isConfirmed = status === 1;
    const cashId = String(this.form.controls.idCash.value ?? '').trim();
    const bankId = String(this.form.controls.idBank.value ?? '').trim();

    if (isConfirmed && paymentType === 5 && !cashId && !bankId) {
      this.form.controls.idCash.setErrors({ required: true });
      this.form.controls.idBank.setErrors({ required: true });
      this.form.controls.idCash.markAsTouched();
      this.form.controls.idBank.markAsTouched();
      this.toast.error(
        this.translate.instant(
          'For confirmed bank/cash payments, choose at least one account (cash or bank).',
        ),
      );
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const body: CreatePaymentCountRequest = {
      idCustomer: raw.idCustomer,
      paid: raw.paid,
      dscription: raw.dscription.trim(),
      idVehicle: raw.idVehicle,
      idBranch: raw.idBranch,
      paymentType: raw.paymentType,
      bondType: raw.bondType,
      status: raw.status,
      idCash: raw.idCash || undefined,
      idBank: raw.idBank || undefined,
      paidCash: raw.paidCash,
      paidBank: raw.paidBank,
      idBooking: raw.idBooking,
      stutusbooking: raw.stutusbooking,
      fleetId: raw.fleetId.trim(),
    };

    this.loading.set(true);
    this.paymentCountService.create(body).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('Payment count created successfully'));
        this.router.navigate(['/payment-counts']);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to save payment count'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadChannels(): void {
    const fleetId = this.authState.fleetId();
    this.loadingChannels.set(true);
    forkJoin({
      banks: this.bankService.getList(fleetId).pipe(catchError(() => of([]))),
      cashAccounts: this.cashService.getList(fleetId).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ banks, cashAccounts }) => {
        if (banks.length > 0 || cashAccounts.length > 0) {
          this.banks.set(banks);
          this.cashAccounts.set(cashAccounts);
          return;
        }

        forkJoin({
          banks: this.bankService.getList(null).pipe(catchError(() => of([]))),
          cashAccounts: this.cashService.getList(null).pipe(catchError(() => of([]))),
        }).subscribe({
          next: fallback => {
            this.banks.set(fallback.banks);
            this.cashAccounts.set(fallback.cashAccounts);
          },
          complete: () => this.loadingChannels.set(false),
        });
      },
      complete: () => {
        if (this.loadingChannels()) {
          this.loadingChannels.set(false);
        }
      },
    });
  }

  private formatBankLabel(item: Bank): string {
    const name = item.name || '-';
    const accountNumber = item.countingId || '-';
    return `${name} - ${accountNumber}`;
  }

  private formatCashLabel(item: CashAccount): string {
    const name = item.name || '-';
    const accountNumber = item.countingId || '-';
    return `${name} - ${accountNumber}`;
  }

  formatFlowAccount(account: CoreCountingAccountTemplate): string {
    const isArabic = this.translate.currentLang?.startsWith('ar');
    const accountName = isArabic ? account.nameAr : account.nameEn;
    return `${account.countingNumber} - ${accountName}`;
  }

  isCashAccountDisabled(): boolean {
    const paymentType = Number(this.form.controls.paymentType.value ?? 1);
    return ![1, 5].includes(paymentType);
  }

  isBankAccountDisabled(): boolean {
    const paymentType = Number(this.form.controls.paymentType.value ?? 1);
    return ![2, 3, 4, 5].includes(paymentType);
  }

  showCashAccountField(): boolean {
    return !this.isCashAccountDisabled();
  }

  showBankAccountField(): boolean {
    return !this.isBankAccountDisabled();
  }

  private applyBusinessRules(): void {
    const paymentType = Number(this.form.controls.paymentType.value ?? 1);
    const isConfirmed = Number(this.form.controls.status.value ?? 1) === 1;
    const shouldEnableCash = [1, 5].includes(paymentType);
    const shouldEnableBank = [2, 3, 4, 5].includes(paymentType);

    if (shouldEnableCash) {
      this.form.controls.idCash.enable({ emitEvent: false });
    } else {
      this.form.controls.idCash.setValue('', { emitEvent: false });
      this.form.controls.paidCash.setValue(0, { emitEvent: false });
      this.form.controls.idCash.disable({ emitEvent: false });
    }

    if (shouldEnableBank) {
      this.form.controls.idBank.enable({ emitEvent: false });
    } else {
      this.form.controls.idBank.setValue('', { emitEvent: false });
      this.form.controls.paidBank.setValue(0, { emitEvent: false });
      this.form.controls.idBank.disable({ emitEvent: false });
    }

    if (!isConfirmed) {
      this.clearAccountValidators();
      return;
    }

    if (paymentType === 1) {
      this.setControlRequired(this.form.controls.idCash, true);
      this.setControlRequired(this.form.controls.idBank, false);
      return;
    }

    if ([2, 3, 4].includes(paymentType)) {
      this.setControlRequired(this.form.controls.idCash, false);
      this.setControlRequired(this.form.controls.idBank, true);
      return;
    }

    this.setControlRequired(this.form.controls.idCash, false);
    this.setControlRequired(this.form.controls.idBank, false);
  }

  private clearAccountValidators(): void {
    this.setControlRequired(this.form.controls.idCash, false);
    this.setControlRequired(this.form.controls.idBank, false);
  }

  private setControlRequired(control: (typeof this.form.controls)['idCash'], required: boolean): void {
    control.setValidators(required ? [Validators.required] : []);
    control.updateValueAndValidity({ emitEvent: false });
  }

}
