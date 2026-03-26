import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Branch, CategoryVehicle, VehicleStatus, VehicleUpsertRequest } from '../../../models';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BranchService } from '../../../services/branches/branch.service';
import { CategoryVehicleService } from '../../../services/category-vehicles/category-vehicle.service';
import { VehicleService } from '../../../services/vehicles/vehicle.service';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url.utils';
import { FileUploadComponent } from '../../../../../shared/ui/file-upload/file-upload.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, FileUploadComponent, PageHeaderComponent],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  private static readonly SERIAL_NUMBER_REGEX = /^[A-Za-z0-9-]{1,50}$/;
  private static readonly PLATE_NUMBER_REGEX = /^[A-Za-z0-9-\u0600-\u06FF\s]{1,20}$/;
  private static readonly VIN_REGEX = /^[A-HJ-NPR-Z0-9]{11,17}$/i;
  private static readonly INSURANCE_POLICY_REGEX = /^[A-Za-z0-9-]{1,100}$/;
  private static readonly INSURANCE_NUMBER_REGEX = /^[A-Za-z0-9-]{0,50}$/;
  private static readonly ENGINE_REGEX = /^[A-Za-z0-9.\s-]{0,60}$/;

  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authState = inject(AuthStateService);
  private branchService = inject(BranchService);
  private categoryVehicleService = inject(CategoryVehicleService);
  private vehicleService = inject(VehicleService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  isEdit = signal(false);
  vehicleId = signal<string | null>(null);
  loading = signal(false);
  selectedImage = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  branches = signal<Branch[]>([]);
  categories = signal<CategoryVehicle[]>([]);

  form = this.fb.group({
    fleetId: [this.authState.fleetId() || '', [Validators.required]],
    branchId: [null as number | null, [Validators.required, Validators.min(1)]],
    idCategoryVehicle: [null as number | null, [Validators.required, Validators.min(1)]],
    serialNumber: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(VehicleFormComponent.SERIAL_NUMBER_REGEX)]],
    engine: ['', [Validators.maxLength(60), Validators.pattern(VehicleFormComponent.ENGINE_REGEX)]],
    yearMake: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    plateNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(VehicleFormComponent.PLATE_NUMBER_REGEX)]],
    vin: ['', [Validators.minLength(11), Validators.maxLength(17), Validators.pattern(VehicleFormComponent.VIN_REGEX)]],
    color: ['', [Validators.maxLength(30)]],
    insuranceNumber: ['', [Validators.maxLength(50), Validators.pattern(VehicleFormComponent.INSURANCE_NUMBER_REGEX)]],
    insuranceType: [null as number | null],
    insuranceExpires: ['', [Validators.required]],
    licenseExpirationDate: ['', [Validators.required]],
    insurancePolicyNumber: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(VehicleFormComponent.INSURANCE_POLICY_REGEX)]],
    operatinCard: ['', [Validators.required]],
    validityCarRegistration: ['', [Validators.required]],
    countKm: [0, [Validators.min(0)]],
    capacitOil: [0, [Validators.min(0)]],
    status: ['Available' as VehicleStatus],
    isActive: [true],
    notes: [''],
  });

  ngOnInit(): void {
    const fleetId = this.authState.fleetId();
    if (fleetId) {
      this.branchService.getPaginated({ fleetId, pageNumber: 1, pageSize: 100 }).subscribe({
        next: page => this.branches.set(page.items ?? []),
        error: () => this.toast.error(this.translate.instant('Failed to load branches')),
      });

      this.categoryVehicleService.getPaginated({ fleetId, pageNumber: 1, pageSize: 100 }).subscribe({
        next: page => this.categories.set(page.items ?? []),
        error: () => this.toast.error(this.translate.instant('Failed to load categories')),
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit.set(true);
    this.vehicleId.set(id);
    this.loading.set(true);
    this.vehicleService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: vehicle => {
        this.previewUrl.set(resolveMediaUrl(vehicle.imageUrl));
        this.form.patchValue({
          fleetId: vehicle.fleetId,
          branchId: vehicle.branchId ?? null,
          idCategoryVehicle: vehicle.categoryVehicleId ? Number(vehicle.categoryVehicleId) : null,
          serialNumber: vehicle.make,
          engine: vehicle.model,
          yearMake: vehicle.year,
          plateNumber: vehicle.plateNumber,
          vin: vehicle.vin || '',
          color: vehicle.color || '',
          insuranceNumber: '',
          insuranceType: null,
          insuranceExpires: '',
          licenseExpirationDate: '',
          insurancePolicyNumber: '',
          operatinCard: '',
          validityCarRegistration: '',
          countKm: vehicle.mileage ?? 0,
          capacitOil: vehicle.seats ?? 0,
          status: vehicle.status,
          isActive: vehicle.isActive,
          notes: vehicle.notes || '',
        });
      },
      error: () => this.toast.error(this.translate.instant('Failed to load vehicle')),
      complete: () => this.loading.set(false),
    });
  }

  onImageSelected(file: File | null): void {
    this.selectedImage.set(file);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const body: VehicleUpsertRequest = {
      id: this.vehicleId() || undefined,
      fleetId: raw.fleetId,
      branchId: Number(raw.branchId),
      idCategoryVehicle: Number(raw.idCategoryVehicle),
      serialNumber: raw.serialNumber,
      engine: raw.engine || undefined,
      yearMake: raw.yearMake,
      plateNumber: raw.plateNumber,
      vin: raw.vin || undefined,
      color: raw.color || undefined,
      insuranceNumber: raw.insuranceNumber || undefined,
      insuranceType: raw.insuranceType,
      insuranceExpires: raw.insuranceExpires,
      licenseExpirationDate: raw.licenseExpirationDate,
      insurancePolicyNumber: raw.insurancePolicyNumber,
      operatinCard: raw.operatinCard,
      validityCarRegistration: raw.validityCarRegistration,
      countKm: raw.countKm,
      capacitOil: raw.capacitOil,
      status: raw.status,
      isActive: raw.isActive,
      notes: raw.notes || undefined,
      image: this.selectedImage(),
    };

    this.loading.set(true);
    const request$ = this.isEdit() ? this.vehicleService.update(body) : this.vehicleService.create(body);
    request$.subscribe({
      next: () => {
        this.toast.success(this.translate.instant(this.isEdit() ? 'Vehicle updated' : 'Vehicle created'));
        this.router.navigate(['/vehicles']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}






