import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { VehicleService } from '../../../services/vehicles/vehicle.service';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url.utils';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-vehicle-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  templateUrl: './vehicle-gallery.component.html',
  styleUrl: './vehicle-gallery.component.scss',
})
export class VehicleGalleryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authState = inject(AuthStateService);
  private vehicleService = inject(VehicleService);

  imageUrl = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.vehicleService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: vehicle => this.imageUrl.set(resolveMediaUrl(vehicle.imageUrl)),
    });
  }
}





