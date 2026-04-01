import { Injectable } from '@angular/core';

import { AuthStateService } from '../../../core/auth/auth-state.service';
import { SUPER_ADMIN_ALLOWED_PATHS } from '../../../core/auth/super-admin.constants';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly superAdminAllowedPaths = new Set<string>(SUPER_ADMIN_ALLOWED_PATHS);

  constructor(private authState: AuthStateService) {}

  // Keep types flexible to avoid strict typing issues with Menu/SidebarItem
  filterMenu(items: any[], roles: string[], privileges: string[]): any[] {
    const isSuperAdmin = this.authState.isSuperAdmin();

    const filteredItems = items
      .map(item => {
        if (isSuperAdmin) {
          return this.filterSuperAdminMenuItem(item);
        }

        const hasRole = !item.roles || this.authState.hasAnyRole(item.roles);
        const hasPrivilege = !item.privileges || this.authState.hasAnyPrivilege(item.privileges);

        const children = item.children ? this.filterMenu(item.children, roles, privileges) : [];

        if ((hasRole && hasPrivilege) || children.length > 0) {
          return { ...item, children };
        }

        return null;
      })
      .filter(item => item !== null);

    return this.removeEmptyHeaders(filteredItems);
  }

  private filterSuperAdminMenuItem(item: any): any | null {
    if (item?.headTitle1) {
      return { ...item };
    }

    const children = (item.children ?? [])
      .map((child: any) => this.filterSuperAdminMenuItem(child))
      .filter((child: any) => child !== null);

    const hasAllowedPath = this.isSuperAdminAllowedPath(item.path);
    if (hasAllowedPath || children.length > 0) {
      return { ...item, children };
    }

    return null;
  }

  private isSuperAdminAllowedPath(path?: string): boolean {
    if (!path) {
      return false;
    }

    for (const allowedPath of this.superAdminAllowedPaths) {
      if (path === allowedPath || path.startsWith(`${allowedPath}/`)) {
        return true;
      }
    }

    return false;
  }

  private removeEmptyHeaders(items: any[]): any[] {
    return items.filter((item, index) => {
      if (!item?.headTitle1) {
        return true;
      }

      const nextNonNullItem = items.slice(index + 1).find(candidate => candidate !== null);
      return Boolean(nextNonNullItem && !nextNonNullItem.headTitle1);
    });
  }
}

