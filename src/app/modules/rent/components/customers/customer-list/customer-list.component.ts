import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Customer } from '../../../models';
import { CustomerService } from '../../../services/customers/customer.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, PageHeaderComponent, EmptyStateComponent, StatusBadgeComponent],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  private authState = inject(AuthStateService);
  private customerService = inject(CustomerService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  customers = signal<Customer[]>([]);
  search = signal('');
  isActive = signal<boolean | ''>('');
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.customerService
      .getPaginated({
        fleetId: this.authState.fleetId() || undefined,
        pageNumber: 1,
        pageSize: 50,
        search: this.search() || undefined,
        isActive: this.isActive(),
      })
      .subscribe({
        next: page => this.customers.set(page.items ?? []),
        error: err => this.toast.error(err?.message ?? this.translate.instant('Failed to load customers')),
        complete: () => this.loading.set(false),
      });
  }
}






