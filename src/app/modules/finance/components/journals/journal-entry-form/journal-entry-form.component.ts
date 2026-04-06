import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import {
  SmoothSelectComponent,
  SmoothSelectOption,
} from '../../../../../shared/ui/smooth-select/smooth-select.component';
import { CountingEntry } from '../../../models/counting/counting-entry.model';
import {
  CreateJournalEntryRequest,
  JournalDetailLineRequest,
} from '../../../models/journals/journal-entry.model';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';
import { JournalEntryService } from '../../../services/journals/journal-entry.service';

@Component({
  selector: 'app-journal-entry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    SmoothSelectComponent,
  ],
  templateUrl: './journal-entry-form.component.html',
  styleUrl: './journal-entry-form.component.scss',
})
export class JournalEntryFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authState = inject(AuthStateService);
  private destroyRef = inject(DestroyRef);
  private countingService = inject(CountingEntryService);
  private journalService = inject(JournalEntryService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private languageTick = signal(0);
  private readonly minimumRequiredLines = 2;

  loading = signal(false);
  loadingAccounts = signal(false);
  accounts = signal<CountingEntry[]>([]);

  readonly accountOptions = computed<SmoothSelectOption[]>(() => {
    this.languageTick();
    return [
      { label: this.translate.instant('Select account'), value: '' },
      ...this.accounts().map(account => ({
        label: this.formatAccountLabel(account),
        value: account.id,
      })),
    ];
  });

  form = this.fb.group({
    date: ['', [Validators.required]],
    node: ['', [Validators.required, Validators.maxLength(500)]],
    journalType: [true],
    operationType: [1, [Validators.required, Validators.min(0)]],
    status: [1, [Validators.required, Validators.min(0)]],
    isSystemOperation: [false],
    idBranch: [Number(this.authState.branchId() ?? 0), [Validators.required, Validators.min(1)]],
    fleetId: ['', [Validators.required]],
    details: this.fb.array([this.createDetailLineForm(), this.createDetailLineForm()]),
  });

  get detailsArray() {
    return this.form.controls.details;
  }

  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.languageTick.update(value => value + 1);
    });

    this.form.controls.fleetId.setValue(this.authState.fleetId() ?? '');
    this.loadActiveAccounts();
  }

  addLine(): void {
    this.detailsArray.push(this.createDetailLineForm());
  }

  removeLine(index: number): void {
    if (this.detailsArray.length <= this.minimumRequiredLines) {
      this.toast.error(this.translate.instant('At least two lines are required'));
      return;
    }

    this.detailsArray.removeAt(index);
  }

  onDebitInput(index: number): void {
    const line = this.detailsArray.at(index);
    const debit = this.toPositiveNumber(line.controls.debtir.value);
    if (debit > 0 && this.toPositiveNumber(line.controls.credit.value) > 0) {
      line.patchValue({ credit: 0 }, { emitEvent: false });
      line.updateValueAndValidity();
    }
  }

  onCreditInput(index: number): void {
    const line = this.detailsArray.at(index);
    const credit = this.toPositiveNumber(line.controls.credit.value);
    if (credit > 0 && this.toPositiveNumber(line.controls.debtir.value) > 0) {
      line.patchValue({ debtir: 0 }, { emitEvent: false });
      line.updateValueAndValidity();
    }
  }

  totalDebit(): number {
    return this.detailsArray.controls.reduce(
      (total, line) => total + this.toPositiveNumber(line.controls.debtir.value),
      0,
    );
  }

  totalCredit(): number {
    return this.detailsArray.controls.reduce(
      (total, line) => total + this.toPositiveNumber(line.controls.credit.value),
      0,
    );
  }

  difference(): number {
    return this.totalDebit() - this.totalCredit();
  }

  isBalanced(): boolean {
    return Math.abs(this.difference()) < 0.00001;
  }

  hasMinimumLines(): boolean {
    return this.detailsArray.length >= this.minimumRequiredLines;
  }

  canSave(): boolean {
    return (
      !this.loading() &&
      !this.loadingAccounts() &&
      this.accounts().length > 0 &&
      this.form.valid &&
      this.hasMinimumLines() &&
      this.isBalanced()
    );
  }

  onSubmit(): void {
    if (!this.hasMinimumLines()) {
      this.toast.error(this.translate.instant('At least two lines are required'));
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.detailsArray.controls.forEach(line => line.markAllAsTouched());
      return;
    }

    if (!this.isBalanced()) {
      this.toast.error(this.translate.instant('Entry must be balanced before save'));
      return;
    }

    const raw = this.form.getRawValue();
    const parsedDate = new Date(raw.date);
    const details = raw.details.map(detail => this.toDetailRequest(detail));
    const totalDebit = this.totalDebit();
    const totalCredit = this.totalCredit();

    const body: CreateJournalEntryRequest = {
      date: Number.isNaN(parsedDate.getTime()) ? raw.date : parsedDate.toISOString(),
      node: raw.node.trim(),
      journalType: raw.journalType,
      debtir: totalDebit,
      credit: totalCredit,
      balannce: totalDebit - totalCredit,
      operationType: raw.operationType,
      status: raw.status,
      isSystemOperation: raw.isSystemOperation,
      idBranch: raw.idBranch,
      fleetId: raw.fleetId.trim(),
      details,
    };

    this.loading.set(true);
    this.journalService.create(body).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('Journal entry created successfully'));
        this.router.navigate(['/journals']);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to save journal entry'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  formatAmount(value: number): string {
    const locale = this.translate.currentLang?.startsWith('ar') ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private createDetailLineForm() {
    return this.fb.group(
      {
        countingId: ['', [Validators.required]],
        debtir: [0, [Validators.min(0)]],
        credit: [0, [Validators.min(0)]],
        node: ['', [Validators.maxLength(250)]],
      },
      { validators: this.detailLineValidator },
    );
  }

  private readonly detailLineValidator = (control: AbstractControl): ValidationErrors | null => {
    const debit = this.toPositiveNumber(control.get('debtir')?.value);
    const credit = this.toPositiveNumber(control.get('credit')?.value);
    const hasDebit = debit > 0;
    const hasCredit = credit > 0;

    if ((hasDebit && hasCredit) || (!hasDebit && !hasCredit)) {
      return { debitCreditRequired: true };
    }

    return null;
  };

  private loadActiveAccounts(): void {
    const fleetId = this.authState.fleetId();
    this.loadingAccounts.set(true);

    this.countingService.getList(fleetId).subscribe({
      next: entries => {
        const activeEntries = entries
          .filter(entry => this.isEntryActive(entry))
          .sort(
            (left, right) => Number(left.countingNumber ?? 0) - Number(right.countingNumber ?? 0),
          );
        this.accounts.set(activeEntries);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to load accounts'));
        this.loadingAccounts.set(false);
      },
      complete: () => this.loadingAccounts.set(false),
    });
  }

  private isEntryActive(entry: CountingEntry): boolean {
    if (entry.isDeleted) {
      return false;
    }

    if (entry.isActive === false) {
      return false;
    }

    if (typeof entry.status === 'number') {
      return entry.status > 0;
    }

    if (typeof entry.status === 'boolean') {
      return entry.status;
    }

    const status = String(entry.status ?? '')
      .toLowerCase()
      .trim();
    if (!status) {
      return true;
    }

    if (status === '0' || status === 'false') {
      return false;
    }

    if (status.includes('inactive') || status.includes('disabled')) {
      return false;
    }

    if (status.includes('غير') && status.includes('نشط')) {
      return false;
    }

    return true;
  }

  private toDetailRequest(rawLine: {
    countingId: string;
    debtir: number;
    credit: number;
    node: string;
  }): JournalDetailLineRequest {
    const account = this.accounts().find(item => String(item.id) === String(rawLine.countingId));

    return {
      countingId: rawLine.countingId,
      countingNumber: account?.countingNumber,
      debtir: this.toPositiveNumber(rawLine.debtir),
      credit: this.toPositiveNumber(rawLine.credit),
      node: rawLine.node?.trim() || undefined,
    };
  }

  private formatAccountLabel(account: CountingEntry): string {
    const isArabic = this.translate.currentLang?.startsWith('ar');
    const name =
      (isArabic ? account.nameAr : account.nameEn) || account.nameAr || account.nameEn || '-';
    const number = account.countingNumber ?? '-';
    return `${number} - ${name}`;
  }

  private toPositiveNumber(value: unknown): number {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) {
      return 0;
    }

    return numeric < 0 ? 0 : numeric;
  }
}
