import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';
import { Booking, BookingStatus } from '../../../models';
import { BookingService } from '../../../services/booking/booking.service';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class BookingListComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authState = inject(AuthStateService);
  private toast = inject(ToastService);

  bookings = signal<Booking[]>([]);
  loading = signal(false);
  search = signal('');
  status = signal<BookingStatus | ''>('');
  dateFrom = signal('');
  dateTo = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.bookingService
      .getPaginated({
        fleetId: this.authState.fleetId() || undefined,
        pageNumber: 1,
        pageSize: 20,
        search: this.search() || undefined,
        status: this.status(),
        startDate: this.dateFrom() || undefined,
        endDate: this.dateTo() || undefined,
        orderBy: 'CreatedAt',
        orderByDirection: 'DESC',
      })
      .subscribe({
        next: page => this.bookings.set(page.items ?? []),
        error: err => this.toast.error(err?.message ?? 'Failed to load bookings'),
        complete: () => this.loading.set(false),
      });
  }
}
