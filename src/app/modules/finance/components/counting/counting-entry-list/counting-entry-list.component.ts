import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import {
  SmoothSelectComponent,
  SmoothSelectOption,
} from '../../../../../shared/ui/smooth-select/smooth-select.component';
import {
  CountingNumberOutOfRangeError,
  countingNumberByTypeValidator,
  getCountingAccountTypeRange,
} from '../../../common/counting-account-ranges';
import {
  CountingEntry,
  CreateCountingEntryRequest,
  UpdateCountingEntryRequest,
} from '../../../models/counting/counting-entry.model';
import { CountingEntryService } from '../../../services/counting/counting-entry.service';

interface CountingTreeNode {
  id: string;
  level: number;
  name: string;
  countingNumber?: number;
  hasChildren: boolean;
  expanded: boolean;
}

@Component({
  selector: 'app-counting-entry-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    PageHeaderComponent,
    SmoothSelectComponent,
  ],
  templateUrl: './counting-entry-list.component.html',
  styleUrl: './counting-entry-list.component.scss',
})
export class CountingEntryListComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authState = inject(AuthStateService);
  private countingService = inject(CountingEntryService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  entries = signal<CountingEntry[]>([]);
  selectedId = signal<string | null>(null);
  searchTerm = signal('');
  expandedIds = signal<Set<string>>(new Set());

  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);
  loadError = signal<string | null>(null);
  private languageTick = signal(0);

  readonly accountTypeOptions: SmoothSelectOption[] = [
    { label: 'Assets', value: 1 },
    { label: 'Liabilities', value: 2 },
    { label: 'Equity', value: 3 },
    { label: 'Revenue', value: 4 },
    { label: 'Expenses', value: 5 },
  ];

  readonly reportNumberOptions: SmoothSelectOption[] = [
    { label: 'Assets', value: 1 },
    { label: 'Liabilities', value: 2 },
    { label: 'Equity', value: 3 },
    { label: 'Revenue', value: 4 },
    { label: 'Expenses', value: 5 },
  ];

  readonly selectedEntry = computed<CountingEntry | null>(() => {
    const currentId = this.selectedId();
    if (!currentId) {
      return null;
    }

    return this.entries().find(item => item.id === currentId) ?? null;
  });

  readonly parentOptions = computed<SmoothSelectOption[]>(() => {
    this.languageTick();
    const currentNumber = this.form.controls.countingNumber.value;
    const items = this.entries()
      .filter(item => !item.isDeleted)
      .filter(item => item.countingNumber !== currentNumber)
      .sort((left, right) => this.compareEntries(left, right));

    return [
      { label: 'No Parent Account', value: 0 },
      ...items.map(item => ({
        label: this.formatAccountLabel(item),
        value: item.countingNumber ?? 0,
      })),
    ];
  });

  readonly visibleNodes = computed<CountingTreeNode[]>(() => {
    this.languageTick();
    return this.buildTree(this.entries(), this.searchTerm());
  });

  readonly selectedCodeRange = computed(() =>
    getCountingAccountTypeRange(this.form.controls.countingType.value),
  );

  form = this.fb.group(
    {
      id: [''],
      countingNumber: [0, [Validators.required, Validators.min(0)]],
      countingMain: [0, [Validators.required, Validators.min(0)]],
      nameAr: ['', [Validators.required, Validators.maxLength(255)]],
      nameEn: ['', [Validators.maxLength(255)]],
      countingLevel: [1, [Validators.required, Validators.min(1)]],
      debtir: [0, [Validators.required, Validators.min(0)]],
      credit: [0, [Validators.required, Validators.min(0)]],
      balannce: [0, [Validators.required]],
      countingType: [1, [Validators.required, Validators.min(1)]],
      reportNumber: [1, [Validators.required, Validators.min(1)]],
      fleetId: ['', [Validators.required]],
    },
    { validators: countingNumberByTypeValidator() },
  );

  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.languageTick.update(value => value + 1);
    });

    this.form.controls.fleetId.setValue(this.authState.fleetId() ?? '');
    this.loadEntries();
    this.prepareCreateMode();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm.set(target?.value?.trim() ?? '');
  }

  toggleExpand(nodeId: string, event: Event): void {
    event.stopPropagation();

    this.expandedIds.update(existing => {
      const next = new Set(existing);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  selectNode(nodeId: string): void {
    const selected = this.entries().find(item => item.id === nodeId);
    if (!selected) {
      return;
    }

    this.selectedId.set(selected.id);
    this.form.patchValue({
      id: selected.id,
      countingNumber: selected.countingNumber ?? 0,
      countingMain: selected.countingMain ?? 0,
      nameAr: selected.nameAr ?? '',
      nameEn: selected.nameEn ?? '',
      countingLevel: selected.countingLevel ?? 1,
      debtir: selected.debtir ?? 0,
      credit: selected.credit ?? 0,
      balannce: selected.balannce ?? 0,
      countingType: selected.countingType ?? 1,
      reportNumber: selected.reportNumber ?? 1,
      fleetId: this.authState.fleetId() ?? this.form.controls.fleetId.value,
    });
    this.form.markAsPristine();
  }

  onAddNew(): void {
    this.prepareCreateMode();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.countingNumberRangeError()) {
        this.toast.error(this.countingNumberRangeMessage());
      }
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.countingMain === raw.countingNumber && raw.countingMain > 0) {
      this.toast.error(this.translate.instant('You cannot set the account as its own parent'));
      return;
    }

    const fleetId = this.authState.fleetId() ?? raw.fleetId;
    if (!fleetId) {
      this.toast.error(this.translate.instant('FleetId is required'));
      return;
    }

    const payload: CreateCountingEntryRequest = {
      countingNumber: raw.countingNumber,
      countingMain: raw.countingMain,
      countingType: raw.countingType,
      reportNumber: raw.reportNumber,
      countingLevel: raw.countingLevel,
      debtir: raw.debtir,
      credit: raw.credit,
      balannce: raw.balannce,
      nameAr: raw.nameAr.trim(),
      nameEn: raw.nameEn.trim() || undefined,
      fleetId,
    };

    this.saving.set(true);

    const request$ = raw.id
      ? this.countingService.update({ ...payload, id: raw.id } satisfies UpdateCountingEntryRequest)
      : this.countingService.create(payload);

    request$.subscribe({
      next: () => {
        this.toast.success(
          this.translate.instant(
            raw.id ? 'Account updated successfully' : 'Account created successfully',
          ),
        );
        this.loadEntries(raw.id || null);
        if (!raw.id) {
          this.prepareCreateMode();
        }
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to save account'));
        this.saving.set(false);
      },
      complete: () => this.saving.set(false),
    });
  }

  onDelete(): void {
    const id = this.form.controls.id.value;
    if (!id) {
      return;
    }

    this.deleting.set(true);
    this.countingService.softDelete(id).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('Account deleted successfully'));
        this.selectedId.set(null);
        this.prepareCreateMode();
        this.loadEntries();
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('Failed to delete account'));
        this.deleting.set(false);
      },
      complete: () => this.deleting.set(false),
    });
  }

  private loadEntries(preferredId: string | null = null): void {
    const fleetId = this.authState.fleetId();

    this.loading.set(true);
    this.loadError.set(null);

    this.countingService.getList(fleetId).subscribe({
      next: items => {
        const activeItems = items.filter(item => !item.isDeleted);
        this.entries.set(activeItems);
        this.expandedIds.set(new Set(activeItems.map(item => item.id).filter(Boolean)));

        const candidateId = preferredId ?? this.selectedId();
        if (candidateId && activeItems.some(item => item.id === candidateId)) {
          this.selectNode(candidateId);
        }
      },
      error: err => {
        const message = err?.message ?? this.translate.instant('Failed to load accounts');
        this.loadError.set(message);
        this.toast.error(message);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private prepareCreateMode(): void {
    const selected = this.selectedEntry();
    const suggestedParent = selected?.countingNumber ?? 0;
    const suggestedLevel = selected?.countingLevel ? selected.countingLevel + 1 : 1;

    this.selectedId.set(null);
    this.form.reset({
      id: '',
      countingNumber: 0,
      countingMain: suggestedParent,
      nameAr: '',
      nameEn: '',
      countingLevel: suggestedLevel,
      debtir: 0,
      credit: 0,
      balannce: 0,
      countingType: selected?.countingType ?? 1,
      reportNumber: selected?.reportNumber ?? 1,
      fleetId: this.authState.fleetId() ?? '',
    });
  }

  private buildTree(items: CountingEntry[], query: string): CountingTreeNode[] {
    const activeItems = items.filter(item => !!item.id && !item.isDeleted);
    if (activeItems.length === 0) {
      return [];
    }

    const entriesById = new Map(activeItems.map(item => [item.id, item]));
    const countingNumberToId = new Map<number, string>();
    for (const item of activeItems) {
      const number = item.countingNumber;
      if (typeof number === 'number' && !Number.isNaN(number) && !countingNumberToId.has(number)) {
        countingNumberToId.set(number, item.id);
      }
    }

    const childrenByParent = new Map<string | null, string[]>();
    const parentById = new Map<string, string | null>();

    for (const item of activeItems) {
      const parentId = this.resolveParentId(item, countingNumberToId);
      parentById.set(item.id, parentId);
      const bucket = childrenByParent.get(parentId) ?? [];
      bucket.push(item.id);
      childrenByParent.set(parentId, bucket);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const visibleIds = this.resolveVisibleIds(activeItems, parentById, normalizedQuery);
    const expanded = this.expandedIds();
    const forceExpand = normalizedQuery.length > 0;

    const rows: CountingTreeNode[] = [];
    const walk = (nodeId: string, level: number): void => {
      if (!visibleIds.has(nodeId)) {
        return;
      }

      const entry = entriesById.get(nodeId);
      if (!entry) {
        return;
      }

      const children = this.sortEntryIds(
        (childrenByParent.get(nodeId) ?? []).filter(id => visibleIds.has(id)),
        entriesById,
      );
      const isExpanded = forceExpand || expanded.has(nodeId);

      rows.push({
        id: nodeId,
        level,
        name: this.getDisplayName(entry),
        countingNumber: entry.countingNumber,
        hasChildren: children.length > 0,
        expanded: isExpanded,
      });

      if (children.length > 0 && isExpanded) {
        for (const childId of children) {
          walk(childId, level + 1);
        }
      }
    };

    const roots = this.sortEntryIds(
      (childrenByParent.get(null) ?? []).filter(id => visibleIds.has(id)),
      entriesById,
    );

    for (const rootId of roots) {
      walk(rootId, 0);
    }

    return rows;
  }

  private resolveVisibleIds(
    items: CountingEntry[],
    parentById: Map<string, string | null>,
    query: string,
  ): Set<string> {
    if (!query) {
      return new Set(items.map(item => item.id));
    }

    const matchedIds = items
      .filter(item => this.entryMatchesQuery(item, query))
      .map(item => item.id);

    const visibleIds = new Set<string>(matchedIds);
    for (const matchedId of matchedIds) {
      let parent = parentById.get(matchedId) ?? null;
      while (parent) {
        visibleIds.add(parent);
        parent = parentById.get(parent) ?? null;
      }
    }

    return visibleIds;
  }

  private entryMatchesQuery(entry: CountingEntry, query: string): boolean {
    const candidate = `${entry.countingNumber ?? ''} ${entry.nameAr ?? ''} ${entry.nameEn ?? ''}`
      .toLowerCase()
      .trim();
    return candidate.includes(query);
  }

  private resolveParentId(entry: CountingEntry, byNumber: Map<number, string>): string | null {
    const parentNumber = entry.countingMain;
    if (typeof parentNumber !== 'number' || parentNumber <= 0) {
      return null;
    }

    const parentId = byNumber.get(parentNumber);
    if (!parentId || parentId === entry.id) {
      return null;
    }

    return parentId;
  }

  private compareEntries(left: CountingEntry, right: CountingEntry): number {
    const leftNumber = left.countingNumber ?? Number.MAX_SAFE_INTEGER;
    const rightNumber = right.countingNumber ?? Number.MAX_SAFE_INTEGER;

    if (leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    return this.getDisplayName(left).localeCompare(
      this.getDisplayName(right),
      this.localeForSort(),
      {
        sensitivity: 'base',
      },
    );
  }

  private sortEntryIds(ids: string[], entriesById: Map<string, CountingEntry>): string[] {
    return [...ids].sort((leftId, rightId) => {
      const left = entriesById.get(leftId);
      const right = entriesById.get(rightId);
      if (!left || !right) {
        return 0;
      }
      return this.compareEntries(left, right);
    });
  }

  private getDisplayName(entry: CountingEntry): string {
    const isArabic = this.translate.currentLang?.startsWith('ar');
    return (isArabic ? entry.nameAr : entry.nameEn) || entry.nameAr || entry.nameEn || '-';
  }

  private formatAccountLabel(entry: CountingEntry): string {
    const number = entry.countingNumber ?? '-';
    const name = this.getDisplayName(entry);
    return `${number} - ${name}`;
  }

  private localeForSort(): string {
    return this.translate.currentLang?.startsWith('ar') ? 'ar' : 'en';
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
