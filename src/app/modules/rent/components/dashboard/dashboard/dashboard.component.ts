import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';

import { SUPER_ADMIN_ALLOWED_PATHS } from '../../../../../core/auth/super-admin.constants';
import { AuthStateService } from '../../../../../core/auth/auth-state.service';
import { Menu, NavMenuService } from '../../../../../shared/services/layout/nav-menu.service';
import { Branch, User, Vehicle, VehicleGroupSummary } from '../../../models';
import { BranchService } from '../../../services/branches/branch.service';
import { FleetService } from '../../../services/fleet/fleet.service';
import { PrivilegeService } from '../../../services/privileges/privilege.service';
import { RoleService } from '../../../services/roles/role.service';
import { UserService } from '../../../services/users/user.service';
import { VehicleService } from '../../../services/vehicles/vehicle.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../../shared/ui/status-badge/status-badge.component';

interface DashboardShortcutItem {
  title: string;
  path: string;
  imageIcon: string;
}

interface DashboardShortcutSection {
  title: string;
  items: DashboardShortcutItem[];
}

interface DashboardDecisionSignal {
  title: string;
  value: string;
  hint: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

interface DashboardActionItem {
  title: string;
  hint: string;
  path: string;
}

interface DashboardPersona {
  key: 'super-admin' | 'fleet-admin' | 'branch-admin' | 'rental-employee' | 'maintenance-accountant';
  title: string;
  subtitle: string;
  badge: string;
  focus: string;
  decisions: DashboardDecisionSignal[];
  actions: DashboardActionItem[];
}

interface DashboardChartBar {
  label: string;
  value: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly superAdminAllowedPaths = new Set<string>(SUPER_ADMIN_ALLOWED_PATHS);
  private authState = inject(AuthStateService);
  private navMenuService = inject(NavMenuService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private privilegeService = inject(PrivilegeService);
  private fleetService = inject(FleetService);
  private branchService = inject(BranchService);
  private vehicleService = inject(VehicleService);

  loading = signal(false);
  groups = signal<VehicleGroupSummary[]>([]);
  latestUsers = signal<User[]>([]);
  userDistribution = signal({ active: 0, inactive: 0 });
  counts = signal({
    users: 0,
    roles: 0,
    privileges: 0,
    fleets: 0,
    branches: 0,
  });

  totalGroups = computed(() => this.groups().length);
  totalVehicles = computed(() =>
    this.groups().reduce((sum, group) => {
      const groupVehicles = group.categories.reduce((catSum, category) => catSum + (category.vehicleCount ?? 0), 0);
      return sum + groupVehicles;
    }, 0),
  );
  navigationSections = computed(() => this.buildNavigationSections());
  visiblePersonas = computed<DashboardPersona[]>(() => this.buildVisiblePersonas());
  userDistributionChart = computed(() => this.buildUserDistributionChart());
  vehicleCategoryChart = computed(() => this.buildVehicleCategoryChart());

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    const fleetId = this.authState.fleetId() || undefined;
    const branchId = Number(this.authState.branchId() || 0) || undefined;

    forkJoin({
      vehicles: forkJoin([
        this.vehicleService.getList({ fleetId, branchId, status: 'Available' }).pipe(catchError(() => of([]))),
        this.vehicleService.getList({ fleetId, branchId, status: 'Booked' }).pipe(catchError(() => of([]))),
        this.vehicleService.getList({ fleetId, branchId, status: 'Maintenance' }).pipe(catchError(() => of([]))),
        this.vehicleService.getList({ fleetId, branchId, status: 'Inactive' }).pipe(catchError(() => of([]))),
      ]).pipe(
        map(groups => {
          const merged = groups.flat();
          const byId = new Map<string, Vehicle>();
          for (const vehicle of merged) {
            byId.set(String(vehicle.id), vehicle);
          }
          return Array.from(byId.values());
        }),
        catchError(error => of(this.handleDashboardError(error, [] as Vehicle[]))),
      ),
      users: this.userService.getList('Default', { suppressErrorToast: true }, fleetId).pipe(
        catchError(() =>
          this.userService.getList(undefined, { suppressErrorToast: true }, fleetId).pipe(
            catchError(error => of(this.handleDashboardError(error, [] as User[]))),
          ),
        ),
      ),
      roles: this.roleService.getList({ suppressErrorToast: true }).pipe(
        catchError(error => of(this.handleDashboardError(error, [] as never[]))),
      ),
      privileges: this.privilegeService.getList({ suppressErrorToast: true }).pipe(
        catchError(error => of(this.handleDashboardError(error, [] as never[]))),
      ),
      fleets: this.fleetService.getList().pipe(
        catchError(error => of(this.handleDashboardError(error, [] as never[]))),
      ),
      branches: this.branchService.getList(fleetId).pipe(
        catchError(error => of(this.handleDashboardError(error, [] as Branch[]))),
      ),
    }).subscribe({
      next: ({ vehicles, users, roles, privileges, fleets, branches }) => {
        this.groups.set(this.buildVehicleGroups(vehicles ?? []));
        this.applyUsersSnapshot(users ?? [], (users ?? []).length);

        this.counts.update(current => ({
          ...current,
          roles: (roles ?? []).length,
          privileges: (privileges ?? []).length,
          fleets: (fleets ?? []).length,
          branches: (branches ?? []).length,
        }));
      },
      complete: () => this.loading.set(false),
    });
  }

  private handleDashboardError<T>(error: unknown, fallback: T): T {
    return fallback;
  }

  private buildVehicleGroups(items: unknown[]): VehicleGroupSummary[] {
    const grouped = new Map<string, { label: string; count: number }>();

    for (const item of items) {
      const vehicle = item as Record<string, unknown>;
      const rawCategoryId =
        vehicle['categoryVehicleId'] ??
        vehicle['CategoryVehicleId'] ??
        vehicle['idCategoryVehicle'] ??
        vehicle['IdCategoryVehicle'];

      const categoryId = rawCategoryId != null ? String(rawCategoryId) : 'uncategorized';
      const label =
        (vehicle['categoryName'] as string | undefined) ||
        (vehicle['CategoryName'] as string | undefined) ||
        (vehicle['categoryVehicleName'] as string | undefined) ||
        (vehicle['CategoryVehicleName'] as string | undefined) ||
        (categoryId === 'uncategorized' ? 'Uncategorized' : `Category ${categoryId}`);

      const current = grouped.get(categoryId);
      if (current) {
        current.count += 1;
      } else {
        grouped.set(categoryId, { label, count: 1 });
      }
    }

    return Array.from(grouped.entries()).map(([categoryId, entry]) => ({
      groupName: entry.label,
      categories: [
        {
          categoryName: categoryId === 'uncategorized' ? 'Uncategorized' : entry.label,
          vehicleCount: entry.count,
        },
      ],
    }));
  }

  private applyUsersSnapshot(users: User[], totalCount: number): void {
    this.latestUsers.set(users.slice(0, 5));
    this.userDistribution.set({
      active: users.filter(user => user.isActive).length,
      inactive: users.filter(user => !user.isActive).length,
    });
    this.counts.update(current => ({
      ...current,
      users: totalCount,
    }));
  }

  private buildNavigationSections(): DashboardShortcutSection[] {
    const sections: DashboardShortcutSection[] = [];
    let currentSectionTitle: string | null = null;

    for (const item of this.navMenuService.MENUITEMS) {
      if (item.headTitle1) {
        currentSectionTitle = item.headTitle1;
        continue;
      }

      if (!currentSectionTitle) {
        continue;
      }

      const shortcuts = this.extractShortcutItems(item);
      if (shortcuts.length === 0) {
        continue;
      }

      let section = sections.find(entry => entry.title === currentSectionTitle);
      if (!section) {
        section = {
          title: currentSectionTitle,
          items: [],
        };
        sections.push(section);
      }

      section.items.push(...shortcuts);
    }

    return sections;
  }

  private extractShortcutItems(item: Menu): DashboardShortcutItem[] {
    if (!this.canAccessMenuItem(item)) {
      return [];
    }

    if (item.type === 'sub') {
      return (item.children ?? [])
        .filter(child => this.canAccessMenuItem(child))
        .filter(child => !child.path || !this.shouldHideInExplore(child.path))
        .filter((child): child is Menu & { path: string; title: string; imageIcon: string } =>
          !!child.path && !!child.title && !!child.imageIcon,
        )
        .map(child => ({
          title: child.title,
          path: child.path,
          imageIcon: child.imageIcon,
        }));
    }

    if (!item.path || !item.title || !item.imageIcon) {
      return [];
    }

    if (this.shouldHideInExplore(item.path)) {
      return [];
    }

    return [
      {
        title: item.title,
        path: item.path,
        imageIcon: item.imageIcon,
      },
    ];
  }

  private shouldHideInExplore(path: string): boolean {
    return this.toBasePath(path) === '/dashboard';
  }

  canAccessPath(path: string): boolean {
    const basePath = this.toBasePath(path);

    if (this.authState.isSuperAdmin()) {
      return this.isSuperAdminAllowedPath(basePath);
    }

    const menuItem = this.findMenuItemByPath(basePath);
    if (!menuItem) {
      return true;
    }

    return this.authState.hasAnyRole(menuItem.roles ?? []) && this.authState.hasAnyPrivilege(menuItem.privileges ?? []);
  }

  private canAccessMenuItem(item: Menu): boolean {
    if (this.authState.isSuperAdmin()) {
      if (item.path) {
        return this.isSuperAdminAllowedPath(item.path);
      }

      return (item.children ?? []).some(child => this.canAccessMenuItem(child));
    }

    return this.authState.hasAnyRole(item.roles ?? []) && this.authState.hasAnyPrivilege(item.privileges ?? []);
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

  private toBasePath(path: string): string {
    const firstSegment = path.split('/').filter(Boolean)[0];
    return firstSegment ? `/${firstSegment}` : '/';
  }

  private findMenuItemByPath(path: string): Menu | undefined {
    const stack: Menu[] = [...this.navMenuService.MENUITEMS];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      if (current.path === path) {
        return current;
      }

      if (current.children?.length) {
        stack.push(...current.children);
      }
    }

    return undefined;
  }

  visibleActionsForPersona(persona: DashboardPersona): DashboardActionItem[] {
    return persona.actions.filter(action => this.canAccessPath(action.path)).slice(0, 4);
  }

  getPersonaDecisionBars(persona: DashboardPersona): DashboardChartBar[] {
    const raw = persona.decisions.map(decision => ({
      label: decision.title,
      value: this.extractPrimaryNumericValue(decision.value),
    }));
    const max = Math.max(...raw.map(item => item.value), 1);
    return raw.map(item => ({
      label: item.label,
      value: item.value,
      percent: Math.max(8, Math.round((item.value / max) * 100)),
    }));
  }

  private buildUserDistributionChart(): { active: number; inactive: number; activePercent: number; style: string } {
    const distribution = this.userDistribution();
    const total = distribution.active + distribution.inactive;
    const activePercent = total ? Math.round((distribution.active / total) * 100) : 0;
    const style = `conic-gradient(var(--dashboard-chart-active) 0 ${activePercent}%, var(--dashboard-chart-inactive) ${activePercent}% 100%)`;
    return {
      active: distribution.active,
      inactive: distribution.inactive,
      activePercent,
      style,
    };
  }

  private buildVehicleCategoryChart(): DashboardChartBar[] {
    const bars = this.groups()
      .map(group => ({
        label: group.groupName || 'Uncategorized',
        value: group.categories.reduce((sum, item) => sum + (item.vehicleCount ?? 0), 0),
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const max = Math.max(...bars.map(item => item.value), 1);
    return bars.map(item => ({
      label: item.label,
      value: item.value,
      percent: Math.max(10, Math.round((item.value / max) * 100)),
    }));
  }

  private extractPrimaryNumericValue(input: string): number {
    const match = input.match(/(\d+(\.\d+)?)/);
    if (!match) {
      return 0;
    }
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private buildVisiblePersonas(): DashboardPersona[] {
    const roles = this.authState.roles().map(role => role.toLowerCase().trim());
    const privileges = this.authState.privileges().map(privilege => privilege.toLowerCase().trim());
    const counts = this.counts();
    const distribution = this.userDistribution();
    const activeRate = counts.users ? Math.round((distribution.active / counts.users) * 100) : 0;
    const inactiveRate = Math.max(0, 100 - activeRate);
    const vehicles = this.totalVehicles();
    const groups = this.totalGroups();
    const noFleetCoverage = counts.fleets === 0 || counts.branches === 0;
    const accessRisk = counts.roles > 0 ? Math.max(0, counts.privileges - counts.roles * 4) : counts.privileges;
    const personas: DashboardPersona[] = [];
    if (this.authState.isSuperAdmin()) {
      personas.push({
        key: 'super-admin',
        title: 'Super Admin Command Center',
        subtitle: 'System-wide governance, access posture, and operating footprint.',
        badge: 'Global',
        focus: 'Prioritize governance quality, role matrix health, and fleet/branch expansion readiness.',
        decisions: [
          {
            title: 'Access Exposure Score',
            value: `${accessRisk}`,
            hint: 'Higher score means privilege density may be outpacing role structure.',
            tone: accessRisk > 20 ? 'danger' : accessRisk > 8 ? 'warning' : 'success',
          },
          {
            title: 'Operational Coverage',
            value: `${counts.fleets} / ${counts.branches}`,
            hint: noFleetCoverage ? 'Coverage incomplete; verify fleet and branch provisioning.' : 'Coverage footprint is active.',
            tone: noFleetCoverage ? 'warning' : 'primary',
          },
          {
            title: 'Workforce Readiness',
            value: `${activeRate}%`,
            hint: 'Inactive users currently need review or activation.',
            tone: inactiveRate > 25 ? 'warning' : 'success',
          },
        ],
        actions: [
          { title: 'Audit Users', hint: 'Review account lifecycle and activation hygiene.', path: '/users' },
          { title: 'Harden Roles', hint: 'Align role structure with current privilege matrix.', path: '/roles' },
          { title: 'Review Privileges', hint: 'Detect over-permissioned or unused capabilities.', path: '/privileges' },
          { title: 'Expand Fleet', hint: 'Provision new operating fleet units.', path: '/fleet/create' },
        ],
      });
    }

    const isFleetAdmin = roles.some(role => role.includes('fleet')) || privileges.includes('fleet_manage');
    if (isFleetAdmin) {
      personas.push({
        key: 'fleet-admin',
        title: 'Fleet Admin Intelligence',
        subtitle: 'Fleet capacity, branch utilization, and inventory deployment insights.',
        badge: 'Fleet',
        focus: 'Balance vehicle stock, branch load, and user enablement to avoid idle assets.',
        decisions: [
          {
            title: 'Fleet Inventory',
            value: `${vehicles}`,
            hint: 'Total vehicles loaded from list endpoints and grouped by category.',
            tone: vehicles === 0 ? 'warning' : 'primary',
          },
          {
            title: 'Group Diversity',
            value: `${groups}`,
            hint: 'Number of active vehicle categories available for deployment.',
            tone: groups <= 1 ? 'warning' : 'success',
          },
          {
            title: 'Branch Readiness',
            value: `${counts.branches}`,
            hint: 'Branches available to absorb operational demand.',
            tone: counts.branches === 0 ? 'danger' : 'success',
          },
        ],
        actions: [
          { title: 'Add Vehicle', hint: 'Register additional vehicles to raise capacity.', path: '/vehicles/create' },
          { title: 'Review Vehicles', hint: 'Track utilization and status distribution.', path: '/vehicles' },
          { title: 'Manage Branches', hint: 'Tune branch structure and routing.', path: '/branch' },
          { title: 'Create Booking', hint: 'Validate supply against demand in real flow.', path: '/booking/create' },
        ],
      });
    }

    const isBranchAdmin = roles.some(role => role.includes('branch')) || privileges.includes('branch_manage');
    if (isBranchAdmin) {
      personas.push({
        key: 'branch-admin',
        title: 'Branch Admin Operations',
        subtitle: 'Daily branch control for staff, bookings, and service velocity.',
        badge: 'Branch',
        focus: 'Keep branch throughput high by minimizing inactive users and vehicle bottlenecks.',
        decisions: [
          {
            title: 'Team Availability',
            value: `${distribution.active}`,
            hint: 'Inactive users may impact branch throughput.',
            tone: distribution.inactive > 0 ? 'warning' : 'success',
          },
          {
            title: 'Booking Capacity',
            value: `${vehicles}`,
            hint: 'Available inventory at current scope to support booking intake.',
            tone: vehicles === 0 ? 'danger' : 'primary',
          },
          {
            title: 'Security Readiness',
            value: `${counts.roles} Roles`,
            hint: 'Ensure branch team roles are aligned with assigned tasks.',
            tone: counts.roles === 0 ? 'warning' : 'success',
          },
        ],
        actions: [
          { title: 'Create Booking', hint: 'Start new rental process quickly.', path: '/booking/create' },
          { title: 'Add Customer', hint: 'Onboard a new customer profile.', path: '/customers/create' },
          { title: 'Review Bookings', hint: 'Track branch booking statuses.', path: '/booking' },
          { title: 'Review Team', hint: 'Monitor user statuses for branch staff.', path: '/users' },
        ],
      });
    }

    const isMaintenanceAccountant =
      roles.some(role => role.includes('account')) || privileges.includes('financial_reports');
    if (isMaintenanceAccountant) {
      personas.push({
        key: 'maintenance-accountant',
        title: 'Maintenance Accounting View',
        subtitle: 'Financial control over vouchers, journals, and operational account flows.',
        badge: 'Finance',
        focus: 'Reduce reconciliation gaps and ensure every maintenance-related movement is documented.',
        decisions: [
          {
            title: 'Control Surface',
            value: `${counts.privileges}`,
            hint: 'Privileges available for finance workflows and approval boundaries.',
            tone: counts.privileges < 5 ? 'warning' : 'primary',
          },
          {
            title: 'Structure Completeness',
            value: `${counts.roles} / ${counts.users}`,
            hint: 'Compare accounting responsibilities against assigned operators.',
            tone: counts.users === 0 ? 'warning' : 'success',
          },
          {
            title: 'Fleet-linked Scope',
            value: `${counts.fleets}`,
            hint: 'Number of fleets contributing transactions into accounting flows.',
            tone: counts.fleets === 0 ? 'danger' : 'success',
          },
        ],
        actions: [
          { title: 'Open Journals', hint: 'Validate daily accounting entries.', path: '/journals' },
          { title: 'Open Vouchers', hint: 'Review payment count documents.', path: '/payment-counts' },
          { title: 'Bank Accounts', hint: 'Check bank account linkage and readiness.', path: '/banks' },
          { title: 'Cash Accounts', hint: 'Audit cash movement points.', path: '/cash-accounts' },
        ],
      });
    }

    const isRentalEmployee =
      roles.some(role => role.includes('rental') || role.includes('employee')) ||
      privileges.includes('booking_manage') ||
      privileges.includes('customer_manage');
    if (isRentalEmployee || personas.length === 0) {
      personas.push({
        key: 'rental-employee',
        title: 'Rental Employee Console',
        subtitle: 'Frontline execution for bookings, customers, and vehicle assignment.',
        badge: 'Rental',
        focus: 'Increase conversion speed while keeping customer records clean and complete.',
        decisions: [
          {
            title: 'Service Queue Capacity',
            value: `${vehicles}`,
            hint: 'Vehicle count available for immediate booking operations.',
            tone: vehicles < 2 ? 'warning' : 'success',
          },
          {
            title: 'Customer Service Reach',
            value: `${counts.users}`,
            hint: 'Operational users available to process customer requests.',
            tone: counts.users === 0 ? 'danger' : 'primary',
          },
          {
            title: 'Branch Support',
            value: `${counts.branches}`,
            hint: 'Branch points participating in service delivery.',
            tone: counts.branches === 0 ? 'warning' : 'success',
          },
        ],
        actions: [
          { title: 'Create Booking', hint: 'Start a rental contract for a customer.', path: '/booking/create' },
          { title: 'Add Customer', hint: 'Capture new customer details quickly.', path: '/customers/create' },
          { title: 'Review Vehicles', hint: 'Find suitable vehicles for demand.', path: '/vehicles' },
          { title: 'Open Bookings', hint: 'Monitor active and pending bookings.', path: '/booking' },
        ],
      });
    }

    return personas;
  }
}

