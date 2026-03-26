import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Booking } from '../../../models';
import { BookingService } from '../../../services/booking/booking.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
})
export class BookingDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authState = inject(AuthStateService);
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);

  booking = signal<Booking | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.bookingService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: booking => this.booking.set(booking),
      error: () => this.toast.error('Failed to load booking'),
      complete: () => this.loading.set(false),
    });
  }
}






