import { Component, computed, inject, signal } from '@angular/core';

import { Feathericon } from '../../feathericon/feathericon';
import { AuthService } from '../../../services/auth/auth.service';
import { TokenService } from '../../../services/storage/token.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  imports: [Feathericon],
})
export class Profile {
  private auth = inject(AuthService);
  private tokenService = inject(TokenService);

  displayName = signal<string>('User');
  email = signal<string | null>(null);
  roles = signal<string[]>([]);

  primaryRole = computed(() => {
    const list = this.roles();
    if (!list || list.length === 0) return 'User';
    return list[0];
  });

  constructor() {
    const token = this.tokenService.getToken();
    const payload = this.tokenService.decodePayload(token);
    if (payload) {
      const name =
        payload.nameAr ??
        payload.nameEn ??
        payload.fullName ??
        payload.full_name ??
        payload.name ??
        payload.userName ??
        payload.username ??
        payload.unique_name ??
        payload.sub;
      if (name) this.displayName.set(String(name));
      const mail = payload.email ?? payload.Email;
      if (mail) this.email.set(String(mail));
    }
    this.roles.set(this.tokenService.getRoles());
  }

  logout(): void {
    this.auth.logout();
  }
}
