import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import {
  SmoothSelectComponent,
  SmoothSelectOption,
} from '../../../../../shared/ui/smooth-select/smooth-select.component';
import { isCashCountingCandidate } from '../../../common/finance-accounting-blueprints';
import { CreateCashAccountRequest } from '../../../models/cash/cash-account.model';
import { CountingEntry } from '../../../models/counting/counting-entry.model';
import { CashAccountService } from '../../../services/cash/cash-account.service';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';

@Component({
  selector: 'app-cash-account-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    SmoothSelectComponent,
  ],
  templateUrl: './cash-account-form.component.html',
})
export class CashAccountFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authState = inject(AuthStateService);
  private cashService = inject(CashAccountService);
  private countingService = inject(CountingEntryService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  loading = signal(false);
  loadingAccounts = signal(false);
  countingEntries = signal<CountingEntry[]>([]);

  readonly countingOptions = computed<SmoothSelectOption[]>(() => [
    { label: 'Select account from chart', value: '' },
    ...this.countingEntries().map(entry => ({
      label: this.formatAccountLabel(entry),
      value: String(entry.countingNumber ?? entry.id),
    })),
  ]);

  form = this.fb.group({
    countingId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(500)]],
    fleetId: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.form.controls.fleetId.setValue(this.authState.fleetId() ?? '');
    this.loadCountingEntries();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const createdBy = this.authState.currentUser()?.id;
    if (!createdBy) {
      this.toast.error(this.translate.instant('Current user is required'));
      return;
    }

    const raw = this.form.getRawValue();
    const body: CreateCashAccountRequest = {
      id: this.generateUuid(),
      countingId: raw.countingId,
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      createdBy,
      fleetId: raw.fleetId.trim(),
    };

    this.loading.set(true);
    this.cashService.create(body).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('Cash account created successfully'));
        this.router.navigate(['/cash']);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to save cash account'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private generateUuid(): string {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const rand = (Math.random() * 16) | 0;
      const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
      return value.toString(16);
    });
  }

  private loadCountingEntries(): void {
    const fleetId = this.authState.fleetId();
    this.loadingAccounts.set(true);
    this.countingService.getList(fleetId).subscribe({
      next: entries => {
        const activeEntries = entries.filter(entry => !entry.isDeleted);
        const cashEntries = activeEntries.filter(isCashCountingCandidate);
        this.countingEntries.set(cashEntries.length > 0 ? cashEntries : activeEntries);
        if (cashEntries.length === 0 && activeEntries.length > 0) {
          this.toast.info(
            this.translate.instant(
              'No dedicated cash account was detected. Showing all available accounts.',
            ),
          );
        }
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to load accounts'));
        this.loadingAccounts.set(false);
      },
      complete: () => this.loadingAccounts.set(false),
    });
  }

  private formatAccountLabel(entry: CountingEntry): string {
    const isArabic = this.translate.currentLang?.startsWith('ar');
    const name = (isArabic ? entry.nameAr : entry.nameEn) || entry.nameAr || entry.nameEn || '-';
    const number = entry.countingNumber ?? '-';
    return `${number} - ${name}`;
  }
}
