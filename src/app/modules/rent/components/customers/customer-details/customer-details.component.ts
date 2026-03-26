import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Customer } from '../../../models';
import { CustomerService } from '../../../services/customers/customer.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url.utils';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './customer-details.component.html',
})
export class CustomerDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authState = inject(AuthStateService);
  private customerService = inject(CustomerService);
  private toast = inject(ToastService);

  customer = signal<Customer | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.customerService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: customer => this.customer.set(customer),
      error: () => this.toast.error('Failed to load customer'),
      complete: () => this.loading.set(false),
    });
  }

  imageUrl(): string | null {
    return resolveMediaUrl(this.customer()?.imageUrl);
  }
}





