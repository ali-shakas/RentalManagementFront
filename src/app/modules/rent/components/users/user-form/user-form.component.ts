import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { UserService } from '../../../services/users/user.service';
import { RoleService } from '../../../services/roles/role.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { UserCreateRequest, RoleLookup } from '../../../models';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, PageHeaderComponent],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private static readonly USERNAME_REGEX = /^[A-Za-z0-9._-]{3,255}$/;
  private static readonly ARABIC_NAME_REGEX = /^[\u0600-\u06FF\s.'-]{2,255}$/;
  private static readonly ENGLISH_NAME_REGEX = /^[A-Za-z\s.'-]{0,255}$/;

  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal(false);
  userId = signal<string | null>(null);
  roles = signal<RoleLookup[]>([]);
  loading = signal(false);

  form = this.fb.group({
    userName: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(UserFormComponent.USERNAME_REGEX)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', []],
    nameAr: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(UserFormComponent.ARABIC_NAME_REGEX)]],
    nameEn: ['', [Validators.maxLength(255), Validators.pattern(UserFormComponent.ENGLISH_NAME_REGEX)]],
    isActive: [true],
    expirationDate: [''],
    rolesId: [[] as string[]],
  });

  ngOnInit(): void {
    this.roleService.getList().subscribe({
      next: list => this.roles.set(list ?? []),
      error: () => this.toast.error('Failed to load roles'),
    });
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId.set(id);
      this.form.controls.password.clearValidators();
      this.userService.getById(id).subscribe({
        next: user => {
          this.form.patchValue({
            userName: user.userName,
            email: user.email,
          nameAr: user.nameAr ?? '',
          nameEn: user.nameEn ?? '',
            isActive: user.isActive,
            expirationDate: user.expirationDate ? user.expirationDate.slice(0, 10) : '',
            rolesId: user.roleIds ?? user.roles?.map(r => r.id) ?? user.userRoles?.map(r => r.roleLookupId) ?? [],
          });
        },
        error: () => this.toast.error('Failed to load user'),
      });
    } else {
      this.form.controls.password.setValidators([Validators.required]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.loading.set(true);
    const body: UserCreateRequest = {
      userName: raw.userName.trim(),
      email: raw.email.trim(),
      password: raw.password,
      nameAr: raw.nameAr.trim() || undefined,
      nameEn: raw.nameEn.trim() || undefined,
      isActive: raw.isActive,
      expirationDate: raw.expirationDate || undefined,
      rolesId: raw.rolesId,
    };
    const id = this.userId();
    if (id) {
      this.userService.update({ ...body, id }).subscribe({
        next: () => {
          this.toast.success('User updated');
          this.router.navigate(['/users']);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
    } else {
      this.userService.create(body).subscribe({
        next: () => {
          this.toast.success('User created');
          this.router.navigate(['/users']);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
    }
  }

  toggleRole(roleId: string): void {
    const current = this.form.controls.rolesId.value;
    const set = new Set(current);
    if (set.has(roleId)) set.delete(roleId);
    else set.add(roleId);
    this.form.controls.rolesId.setValue(Array.from(set));
  }

  isRoleSelected(roleId: string): boolean {
    return this.form.controls.rolesId.value.includes(roleId);
  }
}





