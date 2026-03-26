import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-security-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, PageHeaderComponent],
  templateUrl: './security-overview.component.html',
})
export class SecurityOverviewComponent implements OnInit {
  private authState = inject(AuthStateService);

  userName = signal<string | null>(null);
  email = signal<string | null>(null);
  roles = signal<string[]>([]);
  privileges = signal<string[]>([]);

  hasAnyAccess = computed(() => this.roles().length > 0 || this.privileges().length > 0);

  ngOnInit(): void {
    const user = this.authState.currentUser();

    this.userName.set(user?.username ?? user?.name ?? null);
    this.email.set(user?.email ?? null);
    this.roles.set(user?.roles ?? []);
    this.privileges.set(user?.privileges ?? []);
  }
}


