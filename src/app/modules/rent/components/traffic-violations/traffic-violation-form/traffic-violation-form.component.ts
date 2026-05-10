import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { FieldValueStateDirective } from '../../../../../shared/directives/field-value-state.directive';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import {
  SmoothSelectComponent,
  SmoothSelectOption,
  SmoothSelectValue,
} from '../../../../../shared/ui/smooth-select/smooth-select.component';
import { focusFirstInvalidControl } from '../../../../../shared/utils/focus-first-invalid-control.util';
import { Booking } from '../../../models';
import { TrafficViolationUpsertRequest } from '../../../models/traffic-violations/traffic-violation.model';
import { BookingService } from '../../../services/booking/booking.service';
import { TrafficViolationService } from '../../../services/traffic-violations/traffic-violation.service';
import { VehicleService } from '../../../services/vehicles/vehicle.service';

@Component({
  selector: 'app-traffic-violation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    FieldValueStateDirective,
    PageHeaderComponent,
    SmoothSelectComponent,
  ],
  templateUrl: './traffic-violation-form.component.html',
  styleUrl: './traffic-violation-form.component.scss',
})
export class TrafficViolationFormComponent implements OnInit {
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private fb = inject(NonNullableFormBuilder);
  private authState = inject(AuthStateService);
  private trafficViolationService = inject(TrafficViolationService);
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  isEdit = signal(false);
  violationId = signal<string | null>(null);
  /** Reference data (bookings / vehicles) or loading one violation for edit */
  initializing = signal(true);
  saving = signal(false);
  bookingOptions = signal<SmoothSelectOption[]>([]);
  /** Raw rows from `GetBookingsQuery` for resolving `vehicleId` after pick */
  bookings = signal<Booking[]>([]);
  /** Resolved via `GetVehicleById` / `VehicleService.getById` */
  selectedVehicleLabel = signal('');
  loadingVehicle = signal(false);

  form = this.fb.group({
    nameViolation: [''],
    idBooking: this.fb.control<number | null>(null, [Validators.required]),
    idVehicle: this.fb.control<number | null>(null, [Validators.required]),
    dateViolation: ['', [Validators.required]],
    violationFine: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    numberViolation: [1, [Validators.required, Validators.min(1)]],
  });

  get idBookingCtrl() {
    return this.form.controls.idBooking;
  }

  get idVehicleCtrl() {
    return this.form.controls.idVehicle;
  }

  onBookingChange(value: SmoothSelectValue): void {
    const next = value === '' || value === null ? null : Number(value);
    this.idBookingCtrl.setValue(Number.isFinite(next as number) ? (next as number) : null);
    this.idBookingCtrl.markAsTouched();

    if (next === null || !Number.isFinite(next)) {
      this.clearVehicleFromBooking();
      return;
    }

    const booking = this.bookings().find(b => Number(b.id) === next);
    if (!booking) {
      this.clearVehicleFromBooking();
      return;
    }

    const vehicleId = Number(booking.vehicleId);
    if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
      this.clearVehicleFromBooking();
      this.toast.error(this.translate.instant('trafficViolations.noVehicleOnBooking'));
      return;
    }

    this.loadVehicleById(vehicleId);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const fleetId = this.authState.fleetId() ?? undefined;
    const branchId = Number(this.authState.branchId() || 0) || 0;

    this.initializing.set(true);
    this.bookingService.getBookings({ fleetId, branchId }).subscribe({
      next: bookings => {
        this.bookings.set(bookings ?? []);
        this.bookingOptions.set(this.toBookingOptions(bookings ?? []));
        if (id) {
          this.isEdit.set(true);
          this.violationId.set(id);
          this.loadViolation(id);
        } else {
          this.initializing.set(false);
        }
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('trafficViolations.referenceLoadFailed'));
        this.initializing.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      focusFirstInvalidControl(this.hostEl.nativeElement);
      return;
    }

    const fleetId = (this.authState.fleetId() ?? '').trim();
    if (!fleetId) {
      this.toast.error(this.translate.instant('FleetId is required'));
      return;
    }

    const raw = this.form.getRawValue();
    const idBooking = Number(raw.idBooking);
    const idVehicle = Number(raw.idVehicle);
    if (!Number.isFinite(idBooking) || idBooking <= 0 || !Number.isFinite(idVehicle) || idVehicle <= 0) {
      this.toast.error(this.translate.instant('trafficViolations.invalidBookingVehicle'));
      return;
    }

    const dateIso = this.toApiDateTime(raw.dateViolation);
    const payload: TrafficViolationUpsertRequest = {
      id: this.violationId() ?? undefined,
      fleetId,
      nameViolation: raw.nameViolation.trim() || undefined,
      idBooking,
      idVehicle,
      dateViolation: dateIso,
      violationFine: Number(raw.violationFine),
      description: raw.description.trim() || undefined,
      numberViolation: Number(raw.numberViolation),
    };

    this.saving.set(true);
    const req$ = this.isEdit()
      ? this.trafficViolationService.update(payload)
      : this.trafficViolationService.create(payload);

    req$.subscribe({
      next: () => {
        this.toast.success(
          this.translate.instant(this.isEdit() ? 'trafficViolations.updated' : 'trafficViolations.created'),
        );
        this.router.navigate(['/traffic-violations']);
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('trafficViolations.saveFailed'));
        this.saving.set(false);
      },
      complete: () => this.saving.set(false),
    });
  }

  private loadViolation(id: string): void {
    this.trafficViolationService.getById(id, this.authState.fleetId()).subscribe({
      next: v => {
        this.form.patchValue({
          nameViolation: v.nameViolation ?? '',
          idBooking: v.idBooking,
          idVehicle: v.idVehicle,
          dateViolation: this.toDatetimeLocalValue(v.dateViolation),
          violationFine: v.violationFine,
          description: v.description ?? '',
          numberViolation: v.numberViolation,
        });
        this.loadVehicleById(v.idVehicle, {
          silent: true,
          after: () => this.initializing.set(false),
        });
      },
      error: err => {
        this.toast.error(err?.message ?? this.translate.instant('trafficViolations.loadOneFailed'));
        this.initializing.set(false);
      },
    });
  }

  private clearVehicleFromBooking(): void {
    this.idVehicleCtrl.setValue(null);
    this.selectedVehicleLabel.set('');
    this.idVehicleCtrl.markAsTouched();
  }

  /**
   * Loads vehicle for display + `idVehicle` using `GetVehicleById` (`Vehicle/{id}/{fleetId}`).
   */
  private loadVehicleById(vehicleId: number, opts?: { silent?: boolean; after?: () => void }): void {
    const fleetId = this.authState.fleetId();
    if (!fleetId?.trim()) {
      this.clearVehicleFromBooking();
      opts?.after?.();
      return;
    }

    if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
      this.clearVehicleFromBooking();
      opts?.after?.();
      return;
    }

    this.loadingVehicle.set(true);
    this.vehicleService
      .getById(String(vehicleId), fleetId)
      .pipe(
        finalize(() => {
          this.loadingVehicle.set(false);
          opts?.after?.();
        }),
      )
      .subscribe({
        next: vehicle => {
          this.idVehicleCtrl.setValue(vehicleId);
          const plate = vehicle.plateNumber?.trim() || '';
          const name = [vehicle.make, vehicle.model].filter(Boolean).join(' ').trim();
          this.selectedVehicleLabel.set([plate, name].filter(Boolean).join(' — ') || String(vehicleId));
          this.idVehicleCtrl.markAsTouched();
        },
        error: err => {
          this.clearVehicleFromBooking();
          if (!opts?.silent) {
            this.toast.error(err?.message ?? this.translate.instant('trafficViolations.vehicleLoadFailed'));
          }
        },
      });
  }

  private toBookingOptions(bookings: Booking[]): SmoothSelectOption[] {
    return bookings.map(b => {
      const idNum = Number(b.id);
      const ref = (b.numberBookingINBasame || b.bookingNumber || '').trim();
      const labelParts = [ref, b.customerName, b.vehiclePlateNumber].filter(Boolean);
      const label = labelParts.length ? labelParts.join(' · ') : `#${b.id}`;
      return { label: String(label), value: idNum };
    });
  }

  /** `datetime-local` value from API date string */
  private toDatetimeLocalValue(iso: string): string {
    if (!iso?.trim()) {
      return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private toApiDateTime(local: string): string {
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) {
      return local;
    }
    return d.toISOString();
  }
}
