import { Routes } from '@angular/router';

import { ADMIN_ROLES, APP_PRIVILEGES } from '../../core/auth/access.constants';
import { authGuard } from '../services/auth/auth.guard';
import { privilegeGuard } from '../services/auth/privilege.guard';

/**
 * مسارات القالب الرئيسي (Content): dashboard + وحدات الميزات عبر loadChildren.
 * المسارات التي لها data.privileges تحتاج صلاحية واحدة على الأقل (بعد authGuard).
 */
export const content: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('../../modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { title: 'Dashboard', breadcrumb: 'Dashboard' },
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadChildren: () => import('../../modules/users/users.module').then(m => m.UsersModule),
    data: { title: 'Users', breadcrumb: 'Users', roles: ADMIN_ROLES },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'roles',
    loadChildren: () => import('../../modules/roles/roles.module').then(m => m.RolesModule),
    data: { title: 'Roles', breadcrumb: 'Roles', roles: ADMIN_ROLES },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'privileges',
    loadChildren: () => import('../../modules/privileges/privileges.module').then(m => m.PrivilegesModule),
    data: { title: 'Privileges', breadcrumb: 'Privileges', roles: ADMIN_ROLES },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'fleet',
    loadChildren: () => import('../../modules/fleet/fleet.module').then(m => m.FleetModule),
    data: { title: 'Fleet', breadcrumb: 'Fleet', privileges: [APP_PRIVILEGES.vehicle] },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'branches',
    loadChildren: () => import('../../modules/branches/branches.module').then(m => m.BranchesModule),
    data: { title: 'Branches', breadcrumb: 'Branches', privileges: [APP_PRIVILEGES.vehicle] },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'vehicles',
    loadChildren: () => import('../../modules/vehicles/vehicles.module').then(m => m.VehiclesModule),
    data: { title: 'Vehicles', breadcrumb: 'Vehicles', privileges: [APP_PRIVILEGES.vehicle] },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'category-vehicles',
    loadChildren: () => import('../../modules/category-vehicles/category-vehicles.module').then(m => m.CategoryVehiclesModule),
    data: { title: 'Category Vehicles', breadcrumb: 'Category Vehicles', privileges: [APP_PRIVILEGES.vehicle] },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'customers',
    loadChildren: () => import('../../modules/customers/customers.module').then(m => m.CustomersModule),
    data: { title: 'Customers', breadcrumb: 'Customers', privileges: [APP_PRIVILEGES.customer] },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'booking',
    loadChildren: () => import('../../modules/booking/booking.module').then(m => m.BookingModule),
    data: { title: 'Booking', breadcrumb: 'Booking', privileges: [APP_PRIVILEGES.booking] },
    canActivate: [authGuard, privilegeGuard],
  },
  {
    path: 'security',
    loadChildren: () => import('../../modules/security/security.module').then(m => m.SecurityModule),
    data: { title: 'Security', breadcrumb: 'Security' },
    canActivate: [authGuard],
  },
];
