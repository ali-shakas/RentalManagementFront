import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { FileUploadComponent } from '../../../../../shared/ui/file-upload/file-upload.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { resolveMediaUrl } from '../../../../../shared/utils/media-url.utils';
import { CustomerUpsertRequest } from '../../../models';
import { CustomerService } from '../../../services/customers/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    FileUploadComponent,
    PageHeaderComponent,
  ],
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
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authState = inject(AuthStateService);
  private customerService = inject(CustomerService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private readonly countryNameToCode = new Map<string, string>();
  private nationalitySuggestionsByLocale: { ar: string[]; en: string[] } = { ar: [], en: [] };
  private readonly nationalityAliasEntries: Array<[string, string]> = [
    ['سعودي', 'SA'],
    ['سعودية', 'SA'],
    ['saudi', 'SA'],
    ['saudi arabian', 'SA'],
    ['مصري', 'EG'],
    ['مصرية', 'EG'],
    ['egyptian', 'EG'],
    ['إماراتي', 'AE'],
    ['إماراتية', 'AE'],
    ['emirati', 'AE'],
    ['كويتي', 'KW'],
    ['كويتية', 'KW'],
    ['kuwaiti', 'KW'],
    ['قطري', 'QA'],
    ['قطرية', 'QA'],
    ['qatari', 'QA'],
    ['بحريني', 'BH'],
    ['بحرينية', 'BH'],
    ['bahraini', 'BH'],
    ['عماني', 'OM'],
    ['عمانية', 'OM'],
    ['omani', 'OM'],
    ['أردني', 'JO'],
    ['أردنية', 'JO'],
    ['jordanian', 'JO'],
    ['لبناني', 'LB'],
    ['لبنانية', 'LB'],
    ['lebanese', 'LB'],
    ['سوري', 'SY'],
    ['سورية', 'SY'],
    ['syrian', 'SY'],
    ['عراقي', 'IQ'],
    ['عراقية', 'IQ'],
    ['iraqi', 'IQ'],
    ['يمني', 'YE'],
    ['يمنية', 'YE'],
    ['yemeni', 'YE'],
    ['هندي', 'IN'],
    ['هندية', 'IN'],
    ['indian', 'IN'],
    ['باكستاني', 'PK'],
    ['باكستانية', 'PK'],
    ['pakistani', 'PK'],
    ['بنغالي', 'BD'],
    ['بنغالية', 'BD'],
    ['bangladeshi', 'BD'],
    ['فلبيني', 'PH'],
    ['فلبينية', 'PH'],
    ['filipino', 'PH'],
    ['تركي', 'TR'],
    ['تركية', 'TR'],
    ['turkish', 'TR'],
    ['أمريكي', 'US'],
    ['أمريكية', 'US'],
    ['american', 'US'],
    ['بريطاني', 'GB'],
    ['بريطانية', 'GB'],
    ['british', 'GB'],
    ['فرنسي', 'FR'],
    ['فرنسية', 'FR'],
    ['french', 'FR'],
    ['ألماني', 'DE'],
    ['ألمانية', 'DE'],
    ['german', 'DE'],
    ['كندي', 'CA'],
    ['كندية', 'CA'],
    ['canadian', 'CA'],
  ];
  private readonly issueCitiesByCountryCode: Record<string, { ar: string[]; en: string[] }> = {
    SA: {
      ar: ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الطائف', 'أبها'],
      en: ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam', 'Khobar', 'Taif', 'Abha'],
    },
    AE: {
      ar: ['دبي', 'أبوظبي', 'الشارقة', 'العين', 'عجمان', 'رأس الخيمة'],
      en: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain', 'Ajman', 'Ras Al Khaimah'],
    },
    EG: {
      ar: ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'أسيوط'],
      en: ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Tanta', 'Assiut'],
    },
    KW: {
      ar: ['مدينة الكويت', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء'],
      en: ['Kuwait City', 'Hawalli', 'Farwaniya', 'Ahmadi', 'Jahra'],
    },
    QA: {
      ar: ['الدوحة', 'الوكرة', 'الريان', 'الخور'],
      en: ['Doha', 'Al Wakrah', 'Al Rayyan', 'Al Khor'],
    },
    BH: {
      ar: ['المنامة', 'المحرق', 'الرفاع', 'مدينة عيسى'],
      en: ['Manama', 'Muharraq', 'Riffa', 'Isa Town'],
    },
    OM: {
      ar: ['مسقط', 'صلالة', 'صحار', 'نزوى', 'صور'],
      en: ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur'],
    },
    JO: {
      ar: ['عمان', 'إربد', 'الزرقاء', 'العقبة'],
      en: ['Amman', 'Irbid', 'Zarqa', 'Aqaba'],
    },
    LB: {
      ar: ['بيروت', 'طرابلس', 'صيدا', 'زحلة'],
      en: ['Beirut', 'Tripoli', 'Sidon', 'Zahle'],
    },
    SY: {
      ar: ['دمشق', 'حلب', 'حمص', 'اللاذقية'],
      en: ['Damascus', 'Aleppo', 'Homs', 'Latakia'],
    },
    IQ: {
      ar: ['بغداد', 'البصرة', 'أربيل', 'الموصل'],
      en: ['Baghdad', 'Basra', 'Erbil', 'Mosul'],
    },
    YE: {
      ar: ['صنعاء', 'عدن', 'تعز', 'الحديدة'],
      en: ['Sanaa', 'Aden', 'Taiz', 'Al Hudaydah'],
    },
    IN: {
      ar: ['مومباي', 'نيودلهي', 'بنغالور', 'حيدر آباد', 'تشيناي'],
      en: ['Mumbai', 'New Delhi', 'Bengaluru', 'Hyderabad', 'Chennai'],
    },
    PK: {
      ar: ['كراتشي', 'لاهور', 'إسلام آباد', 'روالبندي'],
      en: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
    },
    BD: {
      ar: ['دكا', 'شيتاغونغ', 'خولنا', 'راجشاهي'],
      en: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi'],
    },
    PH: {
      ar: ['مانيلا', 'سيبو', 'دافاو', 'كويزون'],
      en: ['Manila', 'Cebu', 'Davao', 'Quezon'],
    },
    TR: {
      ar: ['إسطنبول', 'أنقرة', 'إزمير', 'بورصة'],
      en: ['Istanbul', 'Ankara', 'Izmir', 'Bursa'],
    },
    US: {
      ar: ['نيويورك', 'لوس أنجلوس', 'شيكاغو', 'هيوستن', 'ميامي'],
      en: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    },
    GB: {
      ar: ['لندن', 'مانشستر', 'برمنغهام', 'ليفربول'],
      en: ['London', 'Manchester', 'Birmingham', 'Liverpool'],
    },
    FR: {
      ar: ['باريس', 'ليون', 'مرسيليا', 'تولوز'],
      en: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
    },
    DE: {
      ar: ['برلين', 'ميونخ', 'هامبورغ', 'فرانكفورت'],
      en: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
    },
    CA: {
      ar: ['تورونتو', 'فانكوفر', 'مونتريال', 'أوتاوا'],
      en: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
    },
  };

  isEdit = signal(false);
  customerId = signal<string | null>(null);
  loading = signal(false);
  selectedImage = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  nationalitySuggestions = signal<string[]>([]);
  issuePlaceSuggestions = signal<string[]>([]);

  form = this.fb.group({
    nameAr: [
      '',
      [
        Validators.required,
        Validators.maxLength(200),
        Validators.pattern(CustomerFormComponent.ARABIC_NAME_REGEX),
      ],
    ],
    nameEn: [
      '',
      [Validators.maxLength(200), Validators.pattern(CustomerFormComponent.ENGLISH_NAME_REGEX)],
    ],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    firstMobileNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(CustomerFormComponent.PHONE_REGEX),
      ],
    ],
    secondMobileNumber: [
      '',
      [Validators.maxLength(20), Validators.pattern(CustomerFormComponent.PHONE_REGEX)],
    ],
    thirdMobileNumber: [
      '',
      [Validators.maxLength(20), Validators.pattern(CustomerFormComponent.PHONE_REGEX)],
    ],
    idNationality: [
      '',
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(CustomerFormComponent.IDENTITY_REGEX),
      ],
    ],
    licenceNo: [
      '',
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(CustomerFormComponent.LICENSE_REGEX),
      ],
    ],
    dateDrivinglicense: ['', [Validators.required]],
    dateDrivinglicenseHajri: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(CustomerFormComponent.HIJRI_DATE_REGEX),
      ],
    ],
    dateIdNationality: ['', [Validators.required]],
    nationality: ['', [Validators.required, Validators.maxLength(100)]],
    birthDay: [''],
    plaseIdNationality: ['', [Validators.maxLength(150)]],
    plaseDrivinglicense: ['', [Validators.maxLength(150)]],
    address: ['', [Validators.maxLength(250)]],
    idSubscriptionsOfCustomer: [46],
    taxRecord: [null as number | null],
    notes: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.initializeNationalitySuggestions();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.applyLocalizedNationalitySuggestions();
      this.updateIssuePlaceSuggestions(this.form.controls.nationality.value);
    });
    this.form.controls.nationality.valueChanges
      .pipe(
        startWith(this.form.controls.nationality.value),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(value => this.updateIssuePlaceSuggestions(value));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit.set(true);
    this.customerId.set(id);
    this.loading.set(true);
    this.customerService.getById(id, this.authState.fleetId() ?? '').subscribe({
      next: customer => {
        this.previewUrl.set(resolveMediaUrl(customer.imageUrl));
        this.form.patchValue({
          nameAr: customer.nameAr || customer.fullName || '',
          nameEn: customer.nameEn || '',
          email: customer.email || '',
          firstMobileNumber: customer.firstMobileNumber || customer.phoneNumber || '',
          secondMobileNumber: customer.secondMobileNumber || '',
          thirdMobileNumber: customer.thirdMobileNumber || '',
          idNationality: customer.idNationality || customer.identityNumber || '',
          licenceNo: customer.licenceNo || customer.drivingLicenseNumber || '',
          dateDrivinglicense: this.toDateInputValue(
            customer.dateDrivinglicense || customer.drivingLicenseExpiryDate,
          ),
          dateDrivinglicenseHajri: customer.dateDrivinglicenseHajri || '',
          dateIdNationality: this.toDateInputValue(customer.dateIdNationality),
          nationality: customer.nationality || '',
          birthDay: this.toDateInputValue(customer.birthDay || customer.dateOfBirth),
          plaseIdNationality: customer.plaseIdNationality || '',
          plaseDrivinglicense: customer.plaseDrivinglicense || '',
          address: customer.address || '',
          idSubscriptionsOfCustomer: customer.idSubscriptionsOfCustomer ?? 46,
          taxRecord: customer.taxRecord ?? null,
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

  private toDateInputValue(value?: string): string {
    if (!value) {
      return '';
    }

    const normalized = String(value);
    return normalized.length >= 10 ? normalized.slice(0, 10) : normalized;
  }

  private isArabicUi(): boolean {
    const lang = (this.translate.currentLang || this.translate.getDefaultLang() || 'en').toLowerCase();
    return lang.startsWith('ar');
  }

  private initializeNationalitySuggestions(): void {
    const arabicSuggestions = new Set<string>();
    const englishSuggestions = new Set<string>();

    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames !== 'undefined') {
      const englishDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' });
      const arabicDisplayNames = new Intl.DisplayNames(['ar'], { type: 'region' });

      for (let first = 65; first <= 90; first += 1) {
        for (let second = 65; second <= 90; second += 1) {
          const code = String.fromCharCode(first, second);
          const enName = englishDisplayNames.of(code);
          if (!enName || enName === code) {
            continue;
          }

          const arName = arabicDisplayNames.of(code);
          this.countryNameToCode.set(this.normalizeText(enName), code);
          englishSuggestions.add(enName);

          if (arName && arName !== code) {
            this.countryNameToCode.set(this.normalizeText(arName), code);
            arabicSuggestions.add(arName);
          }
        }
      }
    }

    for (const [alias, code] of this.nationalityAliasEntries) {
      this.countryNameToCode.set(this.normalizeText(alias), code);
    }

    this.nationalitySuggestionsByLocale = {
      ar: this.uniqueSorted(Array.from(arabicSuggestions)),
      en: this.uniqueSorted(Array.from(englishSuggestions)),
    };
    this.applyLocalizedNationalitySuggestions();
  }

  private updateIssuePlaceSuggestions(nationality: string): void {
    const normalizedNationality = this.normalizeText(nationality || '');
    if (!normalizedNationality) {
      this.issuePlaceSuggestions.set([]);
      return;
    }

    const countryCode = this.countryNameToCode.get(normalizedNationality);
    if (!countryCode) {
      this.issuePlaceSuggestions.set([]);
      return;
    }

    const cities = this.issueCitiesByCountryCode[countryCode];
    if (!cities) {
      this.issuePlaceSuggestions.set([]);
      return;
    }

    this.issuePlaceSuggestions.set(
      this.uniqueSorted(this.isArabicUi() ? cities.ar : cities.en),
    );
  }

  private applyLocalizedNationalitySuggestions(): void {
    this.nationalitySuggestions.set(
      this.isArabicUi()
        ? this.nationalitySuggestionsByLocale.ar
        : this.nationalitySuggestionsByLocale.en,
    );
  }

  private uniqueSorted(values: string[]): string[] {
    const uniqueValues = Array.from(new Set(values.filter(Boolean)));
    return uniqueValues.sort((a, b) => a.localeCompare(b, 'ar'));
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
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
      idSubscriptionsOfCustomer: Number(raw.idSubscriptionsOfCustomer || 46),
      fleetId: this.authState.fleetId() || undefined,
      notes: raw.notes || undefined,
      isActive: raw.isActive,
      image: this.selectedImage(),
    };

    this.loading.set(true);
    const request$ = this.isEdit()
      ? this.customerService.update(body)
      : this.customerService.create(body);
    request$.subscribe({
      next: () => {
        this.toast.success(
          this.translate.instant(this.isEdit() ? 'Customer updated' : 'Customer created'),
        );
        this.router.navigate(['/customers']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
