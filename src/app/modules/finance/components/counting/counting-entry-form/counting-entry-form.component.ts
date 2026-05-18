import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SHARED_FORM_FIELD_DIRECTIVES } from '../../../../../shared/forms/shared-form-field.imports';
import { coerceFormNumber, requiredNumber } from '../../../../../shared/validators/required-number.validator';
import { Router, RouterLink } from '@angular/router';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import {
  CountingNumberOutOfRangeError,
  countingNumberByTypeValidator,
  getCountingAccountTypeRange,
} from '../../../common/counting-account-ranges';
import { CreateCountingEntryRequest } from '../../../models/counting/counting-entry.model';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';
import { focusFirstInvalidControl } from '../../../../../shared/utils/focus-first-invalid-control.util';

@Component({
  selector: 'app-counting-entry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    ...SHARED_FORM_FIELD_DIRECTIVES,
  ],
  templateUrl: './counting-entry-form.component.html',
})
export class CountingEntryFormComponent implements OnInit {
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private fb = inject(NonNullableFormBuilder);
  private readonly nullableFb = inject(FormBuilder);
  private authState = inject(AuthStateService);
  private countingService = inject(CountingEntryService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  loading = signal(false);

  readonly selectedCodeRange = computed(() =>
    getCountingAccountTypeRange(this.form.controls.countingType.value),
  );

  form = this.fb.group(
    {
      countingNumber: this.nullableFb.control<number | null>(null, [requiredNumber({ min: 0 })]),
      countingMain: this.nullableFb.control<number | null>(null, [requiredNumber({ min: 0 })]),
      countingType: this.nullableFb.control<number | null>(null, [requiredNumber({ min: 1 })]),
      reportNumber: this.nullableFb.control<number | null>(null, [requiredNumber({ min: 1 })]),
      countingLevel: this.nullableFb.control<number | null>(null, [requiredNumber({ min: 1 })]),
      balannce: this.nullableFb.control<number | null>(null, [requiredNumber()]),
      nameAr: ['', [Validators.required, Validators.maxLength(255)]],
      nameEn: ['', [Validators.maxLength(255)]],
      fleetId: ['', [Validators.required]],
    },
    { validators: countingNumberByTypeValidator() },
  );

  ngOnInit(): void {
    this.form.controls.fleetId.setValue(this.authState.fleetId() ?? '');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      focusFirstInvalidControl(this.hostEl.nativeElement);
      if (this.countingNumberRangeError()) {
        this.toast.error(this.countingNumberRangeMessage());
      }
      return;
    }

    const raw = this.form.getRawValue();
    const body: CreateCountingEntryRequest = {
      countingNumber: coerceFormNumber(raw.countingNumber),
      countingMain: coerceFormNumber(raw.countingMain),
      countingType: coerceFormNumber(raw.countingType, 1),
      reportNumber: coerceFormNumber(raw.reportNumber, 1),
      countingLevel: coerceFormNumber(raw.countingLevel, 1),
      debtir: 0,
      credit: 0,
      balannce: coerceFormNumber(raw.balannce),
      nameAr: raw.nameAr.trim(),
      nameEn: raw.nameEn.trim() || undefined,
      fleetId: raw.fleetId.trim(),
    };

    this.loading.set(true);
    this.countingService.create(body).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('Counting entry created successfully'));
        this.router.navigate(['/counting']);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to save counting entry'));
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  isCountingNumberRangeInvalid(): boolean {
    return Boolean(
      this.countingNumberRangeError() &&
      (this.form.controls.countingNumber.touched || this.form.controls.countingType.touched),
    );
  }

  countingNumberRangeMessage(): string {
    const rangeError = this.countingNumberRangeError();
    if (!rangeError) {
      return '';
    }

    const typeLabel = this.translate.instant(rangeError.typeLabelKey);
    return this.translate.instant(
      'Account number must be between {{min}} and {{max}} for {{type}}.',
      {
        min: rangeError.min,
        max: rangeError.max,
        type: typeLabel,
      },
    );
  }

  private countingNumberRangeError(): CountingNumberOutOfRangeError | null {
    return (
      (this.form.errors?.['countingNumberOutOfRange'] as CountingNumberOutOfRangeError) ?? null
    );
  }
}
