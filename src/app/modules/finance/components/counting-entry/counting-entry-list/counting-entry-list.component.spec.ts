import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CountingEntry } from '../../../models/counting/counting-entry.model';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';
import { CountingEntryListComponent } from '../../counting/counting-entry-list/counting-entry-list.component';

describe('CountingEntryListComponent', () => {
  let fixture: ComponentFixture<CountingEntryListComponent>;
  let component: CountingEntryListComponent;
  let countingServiceSpy: jasmine.SpyObj<CountingEntryService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const fleetId = '11111111-0000-0000-0000-000000000001';

  const mockEntries: CountingEntry[] = [
    {
      id: 'assets',
      countingNumber: 1000,
      countingMain: 0,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 1,
      debtir: 0,
      credit: 0,
      balannce: 0,
      nameAr: 'الأصول',
      nameEn: 'Assets',
      isDeleted: false,
    },
    {
      id: 'cash',
      countingNumber: 1101,
      countingMain: 1000,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 2,
      debtir: 500,
      credit: 0,
      balannce: 500,
      nameAr: 'الصندوق',
      nameEn: 'Cash',
      isDeleted: false,
    },
    {
      id: 'deleted-bank',
      countingNumber: 1102,
      countingMain: 1000,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 2,
      debtir: 0,
      credit: 0,
      balannce: 0,
      nameAr: 'البنك المحذوف',
      nameEn: 'Deleted Bank',
      isDeleted: true,
    },
    {
      id: 'revenue',
      countingNumber: 4000,
      countingMain: 0,
      countingType: 4,
      reportNumber: 4,
      countingLevel: 1,
      debtir: undefined,
      credit: undefined,
      balannce: undefined,
      nameAr: 'الإيرادات',
      nameEn: 'Revenue',
      isDeleted: false,
    },
  ];

  function configure(getListReturn = of(mockEntries)): void {
    countingServiceSpy = jasmine.createSpyObj<CountingEntryService>('CountingEntryService', [
      'getList',
      'create',
      'update',
      'softDelete',
    ]);
    countingServiceSpy.getList.and.returnValue(getListReturn);
    countingServiceSpy.create.and.returnValue(of({}));
    countingServiceSpy.update.and.returnValue(of({}));
    countingServiceSpy.softDelete.and.returnValue(of(true));

    toastSpy = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    TestBed.configureTestingModule({
      imports: [
        CountingEntryListComponent,
        NoopAnimationsModule,
        RouterTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: CountingEntryService, useValue: countingServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthStateService, useValue: { fleetId: jasmine.createSpy('fleetId').and.returnValue(fleetId) } },
      ],
    });

    fixture = TestBed.createComponent(CountingEntryListComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates the component without errors', () => {
    configure();

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('loads counting entries on init using the current fleet id', () => {
    configure();

    fixture.detectChanges();

    expect(countingServiceSpy.getList).toHaveBeenCalledOnceWith(fleetId);
    expect(component.entries().map(item => item.id)).toEqual(['assets', 'cash', 'revenue']);
    expect(component.form.controls.fleetId.value).toBe(fleetId);
  });

  it('displays loaded tree rows and filters out soft-deleted accounts', () => {
    configure();

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    const rows = fixture.nativeElement.querySelectorAll('.counting-tree__row');

    expect(rows.length).toBe(3);
    expect(text).toContain('Assets');
    expect(text).toContain('Cash');
    expect(text).toContain('Revenue');
    expect(text).not.toContain('Deleted Bank');
  });

  it('shows the empty state when the service returns an empty list', () => {
    configure(of([]));

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(component.entries()).toEqual([]);
    expect(text).toContain('No accounts available yet.');
  });

  it('shows and clears loading state around an in-flight request', () => {
    const request$ = new Subject<CountingEntry[]>();
    configure(request$.asObservable());

    fixture.detectChanges();

    expect(component.loading()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Loading...');

    request$.next(mockEntries);
    request$.complete();
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Assets');
  });

  it('filters visible rows when the search term changes', () => {
    configure();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'cash';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(component.searchTerm()).toBe('cash');
    expect(text).toContain('Cash');
    expect(text).toContain('Assets');
    expect(text).not.toContain('Revenue');
    expect(countingServiceSpy.getList).toHaveBeenCalledTimes(1);
  });

  it('limits visible rows by tree level legend filter', () => {
    configure();
    fixture.detectChanges();

    component.onLegendLevelSelect(0);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.counting-tree__row');
    const text = fixture.nativeElement.textContent as string;

    expect(rows.length).toBe(2);
    expect(text).toContain('Assets');
    expect(text).toContain('Revenue');
    expect(text).not.toContain('Cash');
  });

  it('sets error state and shows toast when loading fails', () => {
    configure(throwError(() => new Error('Load failed')));

    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.loadError()).toBe('Load failed');
    expect(toastSpy.error).toHaveBeenCalledWith('Load failed');
    expect(fixture.nativeElement.textContent).toContain('Load failed');
  });

  it('selects a row and formats debit, credit, and balance values into the form', () => {
    configure();
    fixture.detectChanges();

    component.selectNode('cash');
    fixture.detectChanges();

    expect(component.selectedId()).toBe('cash');
    expect(component.form.controls.debtir.value).toBe(500);
    expect(component.form.controls.credit.value).toBe(0);
    expect(component.form.controls.balannce.value).toBe(500);
    expect(component.form.controls.nameEn.value).toBe('Cash');
  });

  it('handles null debit, credit, and balance values as zero when selecting a row', () => {
    configure();
    fixture.detectChanges();

    component.selectNode('revenue');

    expect(component.form.controls.debtir.value).toBe(0);
    expect(component.form.controls.credit.value).toBe(0);
    expect(component.form.controls.balannce.value).toBe(0);
  });

  it('soft deletes the selected account and reloads after success', fakeAsync(() => {
    configure();
    fixture.detectChanges();
    component.selectNode('cash');

    component.onDelete();
    tick();

    expect(countingServiceSpy.softDelete).toHaveBeenCalledOnceWith('cash');
    expect(toastSpy.success).toHaveBeenCalled();
    expect(countingServiceSpy.getList).toHaveBeenCalledTimes(2);
    expect(component.deleting()).toBeFalse();
  }));
});
