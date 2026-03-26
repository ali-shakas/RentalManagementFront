import { Injectable } from '@angular/core';

import { AuthStateService } from '../../../core/auth/auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  constructor(private authState: AuthStateService) {}

  // Keep types flexible to avoid strict typing issues with Menu/SidebarItem
  filterMenu(items: any[], roles: string[], privileges: string[]): any[] {
    const filteredItems = items
      .map(item => {
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

