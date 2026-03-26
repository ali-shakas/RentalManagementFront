import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Vehicle } from '../../../models';
import { ToastService } from '../../../../../shared/services/toast.service';
import { VehicleService } from '../../../services/vehicles/vehicle.service';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url.utils';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.scss',
})
export class VehicleDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authState = inject(AuthStateService);
  private vehicleService = inject(VehicleService);
  private toast = inject(ToastService);

  vehicle = signal<Vehicle | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.vehicleService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: vehicle => this.vehicle.set(vehicle),
      error: () => this.toast.error('Failed to load vehicle'),
      complete: () => this.loading.set(false),
    });
  }

  imageUrl(): string | null {
    return resolveMediaUrl(this.vehicle()?.imageUrl);
  }
}






