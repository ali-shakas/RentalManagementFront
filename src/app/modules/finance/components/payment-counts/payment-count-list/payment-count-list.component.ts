import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PaymentCount } from '../../../models/payment-counts/payment-count.model';
import { FinanceListColumn, FinanceListRow } from '../../../models/shared/finance-list.model';
import { PaymentCountService } from '../../../services/payment-counts/payment-count.service';
import { FinanceListShellComponent } from '../../shared/finance-list-shell/finance-list-shell.component';
import { formatFinanceNumber } from '../../shared/finance-list-formatters';

@Component({
  selector: 'app-payment-count-list',
  standalone: true,
  imports: [FinanceListShellComponent],
  templateUrl: './payment-count-list.component.html',
  styleUrl: './payment-count-list.component.scss',
})
export class PaymentCountListComponent implements OnInit {
  private authState = inject(AuthStateService);
  private paymentCountService = inject(PaymentCountService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  items = signal<PaymentCount[]>([]);
  loading = signal(false);
  loadError = signal<string | null>(null);
  private languageTick = signal(0);

  readonly columns: FinanceListColumn[] = [
    { key: 'paymentNumber', label: 'Payment Number', align: 'end' },
    { key: 'amount', label: 'Paid', align: 'end' },
    { key: 'status', label: 'Status' },
    { key: 'bondType', label: 'Bond Type' },
    { key: 'paymentType', label: 'Payment Type' },
    { key: 'customerId', label: 'Customer', align: 'end' },
    { key: 'vehicleId', label: 'Vehicle', align: 'end' },
    { key: 'branchId', label: 'Branch', align: 'end' },
    { key: 'cashId', label: 'Cash' },
    { key: 'bankId', label: 'Bank' },
    { key: 'paidCash', label: 'Paid Cash', align: 'end' },
    { key: 'paidBank', label: 'Paid Bank', align: 'end' },
    { key: 'bookingId', label: 'Booking', align: 'end' },
  ];

  readonly rows = computed<FinanceListRow[]>(() => {
    this.languageTick();
    return this.items().map(item => ({
      paymentNumber: formatFinanceNumber(item.paymentNumber, this.translate),
      amount: formatFinanceNumber(item.paid, this.translate),
      status:
        item.status === 1
          ? this.translate.instant('Confirmed')
          : item.status === 2
            ? this.translate.instant('Pending')
            : formatFinanceNumber(item.status, this.translate),
      bondType:
        item.bondType === 1
          ? this.translate.instant('Receipt Voucher')
          : item.bondType === 2
            ? this.translate.instant('Payment Voucher')
            : this.translate.instant('Unknown'),
      paymentType:
        item.paymentType === 1
          ? this.translate.instant('Cash')
          : item.paymentType === 2
            ? this.translate.instant('Network/POS')
            : item.paymentType === 3
              ? this.translate.instant('Cheque')
              : item.paymentType === 4
                ? this.translate.instant('Bank Transfer')
                : item.paymentType === 5
                  ? this.translate.instant('Bank/Cash')
                  : this.translate.instant('Unknown'),
      customerId: formatFinanceNumber(item.idCustomer, this.translate),
      vehicleId: formatFinanceNumber(item.idVehicle, this.translate),
      branchId: formatFinanceNumber(item.idBranch, this.translate),
      cashId: item.idCash || '-',
      bankId: item.idBank || '-',
      paidCash: formatFinanceNumber(item.paidCash, this.translate),
      paidBank: formatFinanceNumber(item.paidBank, this.translate),
      bookingId: formatFinanceNumber(item.idBooking, this.translate),
    }));
  });

  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.languageTick.update(value => value + 1);
    });
    this.load();
  }

  private load(): void {
    const fleetId = this.authState.fleetId();

    this.loading.set(true);
    this.loadError.set(null);

    this.paymentCountService.getList(fleetId, this.authState.branchId()).subscribe({
      next: items => this.items.set(items),
      error: err => {
        const message = err?.message ?? this.translate.instant('No records found');
        this.loadError.set(message);
        this.toast.error(message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}

