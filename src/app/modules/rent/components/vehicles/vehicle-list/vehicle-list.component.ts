import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Vehicle, VehicleStatus } from '../../../models';
import { ToastService } from '../../../../../shared/services/toast.service';
import { VehicleService } from '../../../services/vehicles/vehicle.service';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, PageHeaderComponent, EmptyStateComponent, StatusBadgeComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private authState = inject(AuthStateService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  vehicles = signal<Vehicle[]>([]);
  totalCount = signal(0);
  search = signal('');
  status = signal<VehicleStatus | ''>('');
  loading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.vehicleService
      .getPaginated({
        fleetId: this.authState.fleetId() || undefined,
        pageNumber: 1,
        pageSize: 50,
        search: this.search() || undefined,
        status: this.status(),
      })
      .subscribe({
        next: page => {
          this.vehicles.set(page.items ?? []);
          this.totalCount.set(page.totalCount ?? page.items?.length ?? 0);
        },
        error: err => this.toast.error(err?.message ?? this.translate.instant('Failed to load vehicles')),
        complete: () => this.loading.set(false),
      });
  }
}






