import { SidebarItem } from '../models/sidebar.model';

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'home',
    route: '/dashboard',
  },
  {
    label: 'Users',
    icon: 'users',
    route: '/users',
    privileges: ['ViewUser'],
  },
  {
    label: 'Add User',
    icon: 'user-plus',
    route: '/users/create',
    privileges: ['CreateUser'],
  },
  {
    label: 'Security',
    icon: 'shield',
    route: '/security',
    roles: ['Admin', 'Manager'],
  },
];

