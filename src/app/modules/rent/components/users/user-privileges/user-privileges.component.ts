import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UserService } from '../../../services/users/user.service';
import { PrivilegeService } from '../../../services/privileges/privilege.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { User, PrivilegeTypeLookup } from '../../../models';

@Component({
  selector: 'app-user-privileges',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-privileges.component.html',
  styleUrl: './user-privileges.component.scss',
})
export class UserPrivilegesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private privilegeService = inject(PrivilegeService);
  private toast = inject(ToastService);

  userId = signal<string>('');
  user = signal<User | null>(null);
  privileges = signal<PrivilegeTypeLookup[]>([]);
  selectedIds = signal<Set<string>>(new Set());
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.userId.set(id);
    this.userService.getById(id).subscribe({
      next: user => {
        this.user.set(user);
        const activePrivileges =
          user.userPrivileges?.filter(p => p.isActive).map(p => p.privilegeTypeId) ?? user.privilegeTypeIds ?? [];
        this.selectedIds.set(new Set(activePrivileges));
      },
      error: () => this.toast.error('Failed to load user'),
    });
    this.privilegeService.getList().subscribe({
      next: list => this.privileges.set(list ?? []),
      error: () => this.toast.error('Failed to load privileges'),
    });
  }

  toggle(privilegeId: string): void {
    const set = new Set(this.selectedIds());
    if (set.has(privilegeId)) set.delete(privilegeId);
    else set.add(privilegeId);
    this.selectedIds.set(set);
  }

  isSelected(privilegeId: string): boolean {
    return this.selectedIds().has(privilegeId);
  }

  save(): void {
    this.loading.set(true);
    const privilegeTypeIds = Array.from(this.selectedIds());
    this.userService
      .updatePrivileges({
        userId: this.userId(),
        privilegeTypeIds,
        userPrivileges: privilegeTypeIds.map(privilegeTypeId => ({ privilegeTypeId, isActive: true })),
      })
      .subscribe({
        next: () => {
          this.toast.success('Privileges updated');
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }
}





