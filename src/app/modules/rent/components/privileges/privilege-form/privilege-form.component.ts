import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PrivilegeTypeCreateRequest } from '../../../models';
import { PrivilegeService } from '../../../services/privileges/privilege.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-privilege-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, PageHeaderComponent],
  templateUrl: './privilege-form.component.html',
})
export class PrivilegeFormComponent implements OnInit {
  private static readonly ARABIC_NAME_REGEX = /^[\u0600-\u06FF\s.'-]{2,255}$/;
  private static readonly ENGLISH_NAME_REGEX = /^[A-Za-z\s.'-]{2,255}$/;
  private static readonly PRIVILEGE_CODE_REGEX = /^[A-Z0-9_]{3,500}$/;

  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private privilegeService = inject(PrivilegeService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  isEdit = signal(false);
  privilegeId = signal<string | null>(null);
  loading = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(PrivilegeFormComponent.ARABIC_NAME_REGEX)]],
    nameEn: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(PrivilegeFormComponent.ENGLISH_NAME_REGEX)]],
    privilegeName: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(PrivilegeFormComponent.PRIVILEGE_CODE_REGEX)]],
    order: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isEdit.set(true);
    this.privilegeId.set(id);
    this.loading.set(true);
    this.privilegeService.getById(id).subscribe({
      next: privilege => {
        this.form.patchValue({
          name: privilege.name || '',
          nameEn: privilege.nameEn || '',
          privilegeName: privilege.privilegeName || '',
          order: privilege.order ?? 0,
        });
      },
      error: () => this.toast.error(this.translate.instant('Failed to load privilege')),
      complete: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const body: PrivilegeTypeCreateRequest = {
      name: raw.name.trim(),
      nameEn: raw.nameEn.trim(),
      privilegeName: raw.privilegeName.trim(),
      order: raw.order,
    };

    this.loading.set(true);
    const request$ = this.privilegeId()
      ? this.privilegeService.update({ ...body, id: this.privilegeId()! })
      : this.privilegeService.create(body);

    request$.subscribe({
      next: () => {
        this.toast.success(this.translate.instant(this.isEdit() ? 'Privilege updated' : 'Privilege created'));
        this.router.navigate(['/privileges']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}





