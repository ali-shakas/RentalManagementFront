import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

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

  loading = signal(false);
  loadingChannels = signal(false);
  banks = signal<Bank[]>([]);
  cashAccounts = signal<CashAccount[]>([]);

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
    { label: 'Bank', value: 2 },
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
    Number(this.form.controls.paymentType.value) === 2 ? 'bank' : 'cash',
  );

  readonly suggestedVoucherFlow = computed(() =>
    resolveVoucherFlow(this.form.controls.accountingPurpose.value, this.selectedCollectionChannel()),
  );

  ngOnInit(): void {
    this.form.controls.fleetId.setValue(this.authState.fleetId() ?? '');
    this.loadChannels();
  }

  onSubmit(): void {
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
      banks: this.bankService.getList(fleetId),
      cashAccounts: this.cashService.getList(fleetId),
    }).subscribe({
      next: ({ banks, cashAccounts }) => {
        this.banks.set(banks);
        this.cashAccounts.set(cashAccounts);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to load accounts'));
        this.loadingChannels.set(false);
      },
      complete: () => this.loadingChannels.set(false),
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
}
