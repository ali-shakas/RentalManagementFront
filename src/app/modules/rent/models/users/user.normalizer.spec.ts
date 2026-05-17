import { normalizeUser } from './user.normalizer';
import { User } from './user.model';

describe('normalizeUser', () => {
  it('should normalize user with all fields', () => {
    const raw = {
      id: '123',
      userName: 'john.doe',
      email: 'john@example.com',
      password: 'hashed',
      nameAr: 'جون دو',
      nameEn: 'John Doe',
      isActive: true,
      isAdmin: false,
      expirationDate: '2025-12-31',
      appId: 'app-1',
      companyId: 'comp-1',
      connectionId: 'conn-1',
      connected: true,
      connectionDate: '2024-01-01',
      disconnectionDate: null,
      currentViewingPageUrl: '/dashboard',
      enableAlert: true,
      enableMobileAlerts: false,
      branchId: 1,
      branchNameAr: 'الفرع الرئيسي',
      branchNameEn: 'Main Branch',
      fleetId: 'fleet-1',
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('123');
    expect(normalized.userName).toBe('john.doe');
    expect(normalized.email).toBe('john@example.com');
    expect(normalized.nameAr).toBe('جون دو');
    expect(normalized.isActive).toBe(true);
    expect(normalized.isAdmin).toBe(false);
  });

  it('should normalize user with camelCase properties', () => {
    const raw = {
      id: '456',
      userName: 'jane.doe',
      email: 'jane@example.com',
      nameAr: 'جين دو',
      isActive: false,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('456');
    expect(normalized.userName).toBe('jane.doe');
    expect(normalized.isActive).toBe(false);
  });

  it('should normalize user with PascalCase properties', () => {
    const raw = {
      Id: '789',
      UserName: 'admin.user',
      Email: 'admin@example.com',
      NameAr: 'مسؤول',
      IsActive: true,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('789');
    expect(normalized.userName).toBe('admin.user');
    expect(normalized.email).toBe('admin@example.com');
    expect(normalized.isActive).toBe(true);
  });

  it('should handle null/undefined user', () => {
    const normalized1 = normalizeUser(null);
    const normalized2 = normalizeUser(undefined);

    expect(normalized1.id).toBe('');
    expect(normalized2.id).toBe('');
    expect(normalized1.isActive).toBe(false);
  });

  it('should handle missing optional fields', () => {
    const raw = {
      id: '001',
      userName: 'minimal',
      email: 'minimal@test.com',
      isActive: true,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('001');
    expect(normalized.password).toBeUndefined();
    expect(normalized.nameAr).toBeUndefined();
    expect(normalized.branchId).toBeUndefined();
  });

  it('should handle empty string properties', () => {
    const raw = {
      id: '002',
      userName: '',
      email: '',
      isActive: true,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.userName).toBe('');
    expect(normalized.email).toBe('');
  });

  it('should handle user roles and privileges', () => {
    const raw = {
      id: '003',
      userName: 'user.with.roles',
      email: 'user@example.com',
      isActive: true,
      userRoles: [
        { roleLookupId: 'role-1', userId: '003' },
        { roleLookupId: 'role-2', userId: '003' },
      ],
      userPrivileges: [
        { privilegeTypeId: 'priv-1', isActive: true },
      ],
    };

    const normalized = normalizeUser(raw);

    expect(normalized.userRoles).toBeDefined();
    expect(normalized.userRoles?.length).toBe(2);
    expect(normalized.userPrivileges).toBeDefined();
  });

  it('should convert null values to empty string for required fields', () => {
    const raw = {
      id: null,
      userName: null,
      email: null,
      isActive: null,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('');
    expect(normalized.userName).toBe('');
    expect(normalized.email).toBe('');
    expect(normalized.isActive).toBe(false);
  });

  it('should handle dates properly', () => {
    const raw = {
      id: '004',
      userName: 'user.with.dates',
      email: 'dates@example.com',
      isActive: true,
      expirationDate: '2025-12-31T23:59:59Z',
      connectionDate: '2024-01-01T00:00:00Z',
    };

    const normalized = normalizeUser(raw);

    expect(normalized.expirationDate).toBe('2025-12-31T23:59:59Z');
    expect(normalized.connectionDate).toBe('2024-01-01T00:00:00Z');
  });

  it('should prioritize camelCase over PascalCase', () => {
    const raw = {
      id: 'priority-test',
      Id: 'should-not-use',
      userName: 'correct',
      UserName: 'should-not-use',
      email: 'correct@test.com',
      Email: 'should-not-use@test.com',
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('priority-test');
    expect(normalized.userName).toBe('correct');
    expect(normalized.email).toBe('correct@test.com');
  });

  it('should handle boolean conversions', () => {
    const raw = {
      id: '005',
      userName: 'bool.user',
      email: 'bool@example.com',
      isActive: 1,
      isAdmin: 0,
      connected: true,
      enableAlert: false,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.isActive).toBe(true);
    expect(normalized.isAdmin).toBe(false);
    expect(normalized.connected).toBe(true);
    expect(normalized.enableAlert).toBe(false);
  });

  it('should handle numeric IDs', () => {
    const raw = {
      id: 12345,
      userName: 'numeric.id',
      email: 'numeric@example.com',
      isActive: true,
      branchId: 99,
    };

    const normalized = normalizeUser(raw);

    expect(normalized.id).toBe('12345');
    expect(normalized.branchId).toBe(99);
  });
});
