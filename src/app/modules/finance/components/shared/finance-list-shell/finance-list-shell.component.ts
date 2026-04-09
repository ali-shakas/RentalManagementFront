import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

import { FinanceListColumn, FinanceListRow } from '../../../models/shared/finance-list.model';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { PaginationBarComponent } from '../../../../../shared/ui/pagination-bar/pagination-bar.component';
import { SmoothSelectComponent, SmoothSelectOption } from '../../../../../shared/ui/smooth-select/smooth-select.component';
import { DateRangeFilterComponent, DateRangeValue } from '../../../../../shared/ui/date-range-filter/date-range-filter.component';

@Component({
  selector: 'app-finance-list-shell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterLink,
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationBarComponent,
    SmoothSelectComponent,
    DateRangeFilterComponent,
  ],
  templateUrl: './finance-list-shell.component.html',
  styleUrl: './finance-list-shell.component.scss',
})
export class FinanceListShellComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() emptyTitle = 'No records were returned for the current fleet context.';
  @Input() emptyDescription = '';
  @Input() error: string | null = null;
  @Input() loading = false;
  @Input() count = 0;
  @Input() columns: FinanceListColumn[] = [];
  @Input() rows: FinanceListRow[] = [];
  @Input() createLink: string | null = null;
  @Input() createLabel = 'Create';
  @Input() searchPlaceholder = 'Search';
  @Input() searchValue = '';
  @Input() enableSearch = false;
  @Input() orderByValue = '';
  @Input() orderByDirectionValue: 'asc' | 'desc' = 'desc';
  @Input() orderByOptions: SmoothSelectOption[] = [];
  @Input() enableSorting = false;
  @Input() enableDateRangeFilter = false;
  @Input() dateFrom = '';
  @Input() dateTo = '';
  @Input() pageNumber = 1;
  @Input() totalPages = 1;
  @Input() pageSize = 10;
  @Input() showPageSize = true;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];

  @Output() searchChange = new EventEmitter<string>();
  @Output() orderByChange = new EventEmitter<string>();
  @Output() orderByDirectionChange = new EventEmitter<'asc' | 'desc'>();
  @Output() dateRangeChange = new EventEmitter<DateRangeValue>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly orderByDirectionOptions: SmoothSelectOption[] = [
    { label: 'Newest', value: 'desc' },
    { label: 'Oldest', value: 'asc' },
  ];

  onSearchChange(value: string): void {
    this.searchChange.emit(value ?? '');
  }

  onOrderByChange(value: string | number | null): void {
    this.orderByChange.emit(String(value ?? '').trim());
  }

  onOrderByDirectionChange(value: string | number | null): void {
    const normalized = String(value ?? '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    this.orderByDirectionChange.emit(normalized);
  }

  onDateRangeChange(value: DateRangeValue): void {
    this.dateRangeChange.emit(value);
  }

  trackByIndex(index: number): number {
    return index;
  }
}

