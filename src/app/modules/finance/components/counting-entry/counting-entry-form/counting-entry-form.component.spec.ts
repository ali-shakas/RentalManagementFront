import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';
import { CountingEntryFormComponent } from '../../counting/counting-entry-form/counting-entry-form.component';

describe('CountingEntryFormComponent', () => {
  let fixture: ComponentFixture<CountingEntryFormComponent>;
  let component: CountingEntryFormComponent;
  let countingServiceSpy: jasmine.SpyObj<CountingEntryService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let navigateSpy: jasmine.Spy;

  const fleetId = '11111111-0000-0000-0000-000000000001';

  function configure(options: {
    fleetId?: string | null;
    createResponse?: Observable<unknown>;
  } = {}): void {
    countingServiceSpy = jasmine.createSpyObj<CountingEntryService>('CountingEntryService', [
      'create',
      'getList',
      'update',
    ]);
    countingServiceSpy.create.and.returnValue(options.createResponse ?? of({ id: 'counting-created' }));
    countingServiceSpy.getList.and.returnValue(of([]));
    countingServiceSpy.update.and.returnValue(of({}));

    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    TestBed.configureTestingModule({
      imports: [
        CountingEntryFormComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: CountingEntryService, useValue: countingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: AuthStateService,
          useValue: {
            fleetId: jasmine.createSpy('fleetId').and.returnValue(options.fleetId ?? fleetId),
          },
        },
      ],
    });

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(CountingEntryFormComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function fillValidForm(overrides: Record<string, unknown> = {}): void {
    component.form.patchValue({
      countingNumber: 1101,
      countingMain: 1000,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 2,
      balannce: 0,
      nameAr: 'الصندوق',
      nameEn: 'Cash',
      fleetId,
      ...overrides,
    });
  }

  it('creates the component without errors', () => {
    configure();

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('initializes the form with the actual counting fields and fleet context', () => {
    configure();

    fixture.detectChanges();

    expect(component.form.controls.countingNumber).toBeTruthy();
    expect(component.form.controls.countingMain).toBeTruthy();
    expect(component.form.controls.countingType).toBeTruthy();
    expect(component.form.controls.reportNumber).toBeTruthy();
    expect(component.form.controls.countingLevel).toBeTruthy();
    expect(component.form.controls.balannce).toBeTruthy();
    expect(component.form.controls.nameAr).toBeTruthy();
    expect(component.form.controls.nameEn).toBeTruthy();
    expect(component.form.controls.fleetId.value).toBe(fleetId);
  });

  it('validates required fields and numeric minimums', () => {
    configure();
    fixture.detectChanges();

    component.form.patchValue({
      countingNumber: null,
      countingMain: null,
      countingType: null,
      reportNumber: null,
      countingLevel: null,
      balannce: null,
      nameAr: '',
      fleetId: '',
    });
    component.form.markAllAsTouched();
    component.form.updateValueAndValidity();

    expect(component.form.controls.countingNumber.invalid).toBeTrue();
    expect(component.form.controls.countingMain.invalid).toBeTrue();
    expect(component.form.controls.countingType.invalid).toBeTrue();
    expect(component.form.controls.reportNumber.invalid).toBeTrue();
    expect(component.form.controls.countingLevel.invalid).toBeTrue();
    expect(component.form.controls.balannce.invalid).toBeTrue();
    expect(component.form.controls.nameAr.hasError('required')).toBeTrue();
    expect(component.form.controls.fleetId.hasError('required')).toBeTrue();

    component.form.controls.countingType.setValue(0);
    component.form.controls.reportNumber.setValue(0);
    component.form.controls.countingLevel.setValue(0);

    expect(component.form.controls.countingType.invalid).toBeTrue();
    expect(component.form.controls.reportNumber.invalid).toBeTrue();
    expect(component.form.controls.countingLevel.invalid).toBeTrue();
  });

  it('creates a root account using countingMain zero and level one', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({
      countingNumber: 1000,
      countingMain: 0,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 1,
      nameAr: 'الأصول',
      nameEn: 'Assets',
    });

    component.onSubmit();

    expect(countingServiceSpy.create).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      countingNumber: 1000,
      countingMain: 0,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 1,
      nameAr: 'الأصول',
      nameEn: 'Assets',
      fleetId,
    }));
  });

  it('creates a child account with parent counting number and level mapping', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({
      countingNumber: 1201,
      countingMain: 1000,
      countingType: 1,
      countingLevel: 2,
      nameAr: 'العملاء',
      nameEn: 'Customers',
    });

    component.onSubmit();

    expect(countingServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      countingNumber: 1201,
      countingMain: 1000,
      countingType: 1,
      countingLevel: 2,
      nameAr: 'العملاء',
    }));
  });

  it('validates account code range for assets', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ countingNumber: 2101, countingType: 1 });
    component.form.controls.countingNumber.markAsTouched();
    component.form.updateValueAndValidity();

    expect(component.form.hasError('countingNumberOutOfRange')).toBeTrue();
    expect(component.isCountingNumberRangeInvalid()).toBeTrue();
    expect(component.countingNumberRangeMessage()).toBeTruthy();
  });

  it('validates account code range for liabilities, equity, revenue, and expenses', () => {
    configure();
    fixture.detectChanges();

    [
      { countingType: 2, validCode: 2201, invalidCode: 1201 },
      { countingType: 3, validCode: 3000, invalidCode: 4101 },
      { countingType: 4, validCode: 4201, invalidCode: 5101 },
      { countingType: 5, validCode: 5101, invalidCode: 4101 },
    ].forEach(item => {
      fillValidForm({ countingType: item.countingType, countingNumber: item.validCode });
      component.form.updateValueAndValidity();
      expect(component.form.hasError('countingNumberOutOfRange')).toBeFalse();

      component.form.controls.countingNumber.setValue(item.invalidCode);
      component.form.updateValueAndValidity();
      expect(component.form.hasError('countingNumberOutOfRange')).toBeTrue();
    });
  });

  it('rejects non-numeric account code values', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ countingNumber: 'ABC' as any });

    component.form.updateValueAndValidity();

    expect(component.form.controls.countingNumber.invalid).toBeTrue();
  });

  it('allows zero balance and code 0000 only when type range is not selected', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ countingNumber: 0, countingType: null, balannce: 0 });

    component.form.updateValueAndValidity();

    expect(component.form.controls.balannce.valid).toBeTrue();
    expect(component.form.controls.countingNumber.valid).toBeTrue();
    expect(component.form.controls.countingType.invalid).toBeTrue();
  });

  it('trims Arabic and English names before submit', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({
      nameAr: '  إيرادات التأجير  ',
      nameEn: '  Rental Revenue  ',
      countingNumber: 4101,
      countingMain: 4000,
      countingType: 4,
    });

    component.onSubmit();

    expect(countingServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nameAr: 'إيرادات التأجير',
      nameEn: 'Rental Revenue',
    }));
  });

  it('omits optional English name when it is empty', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ nameEn: '' });

    component.onSubmit();

    expect(countingServiceSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      nameEn: undefined,
    }));
  });

  it('prevents submit when invalid and marks controls as touched', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ nameAr: '', countingNumber: 2101, countingType: 1 });

    component.onSubmit();

    expect(countingServiceSpy.create).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
    expect(toastSpy.error).toHaveBeenCalled();
  });

  it('shows range validation toast when submit is out of account type range', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ countingNumber: 999, countingType: 1 });

    component.onSubmit();

    expect(countingServiceSpy.create).not.toHaveBeenCalled();
    expect(toastSpy.error).toHaveBeenCalledWith(component.countingNumberRangeMessage());
  });

  it('shows success toast and navigates after create success', () => {
    configure();
    fixture.detectChanges();
    fillValidForm();

    component.onSubmit();

    expect(toastSpy.success).toHaveBeenCalledWith('Counting entry created successfully');
    expect(navigateSpy).toHaveBeenCalledWith(['/counting']);
    expect(component.loading()).toBeFalse();
  });

  it('shows API error and keeps the form available on create failure', () => {
    configure({ createResponse: throwError(() => new Error('Backend validation failed')) });
    fixture.detectChanges();
    fillValidForm();

    component.onSubmit();

    expect(toastSpy.error).toHaveBeenCalledWith('Backend validation failed');
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('does not load parent accounts because current form uses countingMain directly', () => {
    configure();

    fixture.detectChanges();

    expect(countingServiceSpy.getList).not.toHaveBeenCalled();
  });

  it('does not call update because current screen only supports create mode', () => {
    configure();
    fixture.detectChanges();
    fillValidForm({ countingNumber: 5101, countingMain: 5000, countingType: 5, nameAr: 'مصروف صيانة' });

    component.onSubmit();

    expect(countingServiceSpy.update).not.toHaveBeenCalled();
    expect(countingServiceSpy.create).toHaveBeenCalled();
  });

  it('rejects very long Arabic and English names', () => {
    configure();
    fixture.detectChanges();
    const longName = 'أ'.repeat(256);

    fillValidForm({ nameAr: longName, nameEn: 'E'.repeat(256) });
    component.form.updateValueAndValidity();

    expect(component.form.controls.nameAr.hasError('maxlength')).toBeTrue();
    expect(component.form.controls.nameEn.hasError('maxlength')).toBeTrue();
  });
});
