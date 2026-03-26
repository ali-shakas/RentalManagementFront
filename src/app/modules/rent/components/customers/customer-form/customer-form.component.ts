import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { CustomerUpsertRequest } from '../../../models';
import { CustomerService } from '../../../services/customers/customer.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url.utils';
import { FileUploadComponent } from '../../../../../shared/ui/file-upload/file-upload.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, FileUploadComponent, PageHeaderComponent],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  private static readonly ARABIC_NAME_REGEX = /^[\u0600-\u06FF\s.'-]{2,200}$/;
  private static readonly ENGLISH_NAME_REGEX = /^[A-Za-z\s.'-]{2,200}$/;
  private static readonly PHONE_REGEX = /^(?:(?:\+966|00966)(?:5\d{8}|1\d{8})|0(?:5\d{8}|1\d{8}))$/;
  private static readonly IDENTITY_REGEX = /^[A-Za-z0-9-]{5,50}$/;
  private static readonly LICENSE_REGEX = /^[A-Za-z0-9-]{3,50}$/;
  private static readonly HIJRI_DATE_REGEX = /^[0-9/\-]{3,20}$/;

  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authState = inject(AuthStateService);
  private customerService = inject(CustomerService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  isEdit = signal(false);
  customerId = signal<string | null>(null);
  loading = signal(false);
  selectedImage = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  form = this.fb.group({
    nameAr: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(CustomerFormComponent.ARABIC_NAME_REGEX)]],
    nameEn: ['', [Validators.maxLength(200), Validators.pattern(CustomerFormComponent.ENGLISH_NAME_REGEX)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    firstMobileNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(CustomerFormComponent.PHONE_REGEX)]],
    secondMobileNumber: ['', [Validators.maxLength(20), Validators.pattern(CustomerFormComponent.PHONE_REGEX)]],
    thirdMobileNumber: ['', [Validators.maxLength(20), Validators.pattern(CustomerFormComponent.PHONE_REGEX)]],
    idNationality: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(CustomerFormComponent.IDENTITY_REGEX)]],
    licenceNo: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(CustomerFormComponent.LICENSE_REGEX)]],
    dateDrivinglicense: ['', [Validators.required]],
    dateDrivinglicenseHajri: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(CustomerFormComponent.HIJRI_DATE_REGEX)]],
    dateIdNationality: ['', [Validators.required]],
    nationality: ['', [Validators.required, Validators.maxLength(100)]],
    birthDay: [''],
    plaseIdNationality: ['', [Validators.maxLength(150)]],
    plaseDrivinglicense: ['', [Validators.maxLength(150)]],
    address: ['', [Validators.maxLength(250)]],
    idSubscriptionsOfCustomer: [1, [Validators.required, Validators.min(1)]],
    taxRecord: [null as number | null],
    notes: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit.set(true);
    this.customerId.set(id);
    this.loading.set(true);
    this.customerService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: customer => {
        this.previewUrl.set(resolveMediaUrl(customer.imageUrl));
        this.form.patchValue({
          nameAr: customer.fullName,
          nameEn: '',
          email: customer.email || '',
          firstMobileNumber: customer.phoneNumber || '',
          secondMobileNumber: '',
          thirdMobileNumber: '',
          idNationality: customer.identityNumber || '',
          licenceNo: customer.drivingLicenseNumber || '',
          dateDrivinglicense: customer.drivingLicenseExpiryDate?.slice(0, 10) || '',
          dateDrivinglicenseHajri: '',
          dateIdNationality: '',
          nationality: customer.nationality || '',
          birthDay: customer.dateOfBirth?.slice(0, 10) || '',
          plaseIdNationality: '',
          plaseDrivinglicense: '',
          address: customer.address || '',
          idSubscriptionsOfCustomer: 1,
          taxRecord: null,
          notes: customer.notes || '',
          isActive: customer.isActive,
        });
      },
      error: () => this.toast.error(this.translate.instant('Failed to load customer')),
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
    const body: CustomerUpsertRequest = {
      id: this.customerId() || undefined,
      nameAr: raw.nameAr,
      nameEn: raw.nameEn || undefined,
      firstMobileNumber: raw.firstMobileNumber,
      secondMobileNumber: raw.secondMobileNumber || undefined,
      thirdMobileNumber: raw.thirdMobileNumber || undefined,
      address: raw.address || undefined,
      licenceNo: raw.licenceNo,
      idNationality: raw.idNationality,
      dateIdNationality: raw.dateIdNationality,
      birthDay: raw.birthDay || undefined,
      plaseIdNationality: raw.plaseIdNationality || undefined,
      plaseDrivinglicense: raw.plaseDrivinglicense || undefined,
      nationality: raw.nationality,
      dateDrivinglicense: raw.dateDrivinglicense,
      dateDrivinglicenseHajri: raw.dateDrivinglicenseHajri,
      taxRecord: raw.taxRecord ?? undefined,
      email: raw.email || undefined,
      idSubscriptionsOfCustomer: Number(raw.idSubscriptionsOfCustomer),
      fleetId: this.authState.fleetId() || undefined,
      notes: raw.notes || undefined,
      isActive: raw.isActive,
      image: this.selectedImage(),
    };

    this.loading.set(true);
    const request$ = this.isEdit() ? this.customerService.update(body) : this.customerService.create(body);
    request$.subscribe({
      next: () => {
        this.toast.success(this.translate.instant(this.isEdit() ? 'Customer updated' : 'Customer created'));
        this.router.navigate(['/customers']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}






