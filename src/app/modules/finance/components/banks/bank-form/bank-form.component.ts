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
import { isBankCountingCandidate } from '../../../common/finance-accounting-blueprints';
import { CreateBankRequest } from '../../../models/banks/bank.model';
import { CountingEntry } from '../../../models/counting/counting-entry.model';
import { BankService } from '../../../services/banks/bank.service';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';

@Component({
  selector: 'app-bank-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    SmoothSelectComponent,
  ],
  templateUrl: './bank-form.component.html',
})
export class BankFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authState = inject(AuthStateService);
  private bankService = inject(BankService);
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
    code: ['', [Validators.maxLength(100)]],
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

    const raw = this.form.getRawValue();
    const body: CreateBankRequest = {
      countingId: raw.countingId,
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      code: raw.code.trim() || undefined,
      fleetId: raw.fleetId.trim(),
    };

    this.loading.set(true);
    this.bankService.create(body).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('Bank created successfully'));
        this.router.navigate(['/banks']);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to save bank'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadCountingEntries(): void {
    const fleetId = this.authState.fleetId();
    this.loadingAccounts.set(true);
    this.countingService.getList(fleetId).subscribe({
      next: entries => {
        const activeEntries = entries.filter(entry => !entry.isDeleted);
        const bankEntries = activeEntries.filter(isBankCountingCandidate);
        this.countingEntries.set(bankEntries.length > 0 ? bankEntries : activeEntries);
        if (bankEntries.length === 0 && activeEntries.length > 0) {
          this.toast.info(
            this.translate.instant(
              'No dedicated bank account was detected. Showing all available accounts.',
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
