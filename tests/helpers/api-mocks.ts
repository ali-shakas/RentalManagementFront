import { Page, Route } from '@playwright/test';

import { TEST_BRANCH_ID, TEST_FLEET_ID } from './auth';

const ids = {
  countingAssets: '99999999-0000-0000-0000-000000001000',
  countingCash: '99999999-0000-0000-0000-000000001101',
  countingBank: '99999999-0000-0000-0000-000000001102',
  countingRevenue: '99999999-0000-0000-0000-000000004101',
  branch: '1',
  vehicle: '101',
  customer: '201',
  journal: '301',
  financialYear: '401',
};

export const mockData = {
  branches: [
    {
      id: Number(ids.branch),
      nameAr: 'الفرع الرئيسي',
      nameEn: 'Main Branch',
      code: 'BR-001',
      isActive: true,
      fleetId: TEST_FLEET_ID,
    },
  ],
  countings: [
    {
      id: ids.countingAssets,
      countingNumber: 1000,
      countingMain: 0,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 1,
      debtir: 0,
      credit: 0,
      balannce: 0,
      nameAr: 'الأصول',
      nameEn: 'Assets',
      fleetId: TEST_FLEET_ID,
      isDeleted: false,
    },
    {
      id: ids.countingCash,
      countingNumber: 1101,
      countingMain: 1000,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 2,
      debtir: 5000,
      credit: 0,
      balannce: 5000,
      nameAr: 'الصندوق',
      nameEn: 'Cash',
      fleetId: TEST_FLEET_ID,
      isDeleted: false,
    },
    {
      id: ids.countingBank,
      countingNumber: 1102,
      countingMain: 1000,
      countingType: 1,
      reportNumber: 1,
      countingLevel: 2,
      debtir: 12000,
      credit: 0,
      balannce: 12000,
      nameAr: 'البنك',
      nameEn: 'Bank',
      fleetId: TEST_FLEET_ID,
      isDeleted: false,
    },
    {
      id: ids.countingRevenue,
      countingNumber: 4101,
      countingMain: 4000,
      countingType: 4,
      reportNumber: 4,
      countingLevel: 2,
      debtir: 0,
      credit: 8500,
      balannce: -8500,
      nameAr: 'إيرادات التأجير اليومي',
      nameEn: 'Daily Rental Revenue',
      fleetId: TEST_FLEET_ID,
      isDeleted: false,
    },
  ],
  vehicles: [
    {
      id: ids.vehicle,
      plateNumber: 'ABC-1234',
      serialNumber: 'SN-101',
      yearMake: 2025,
      engine: '2.0L',
      status: 'Available',
      fleetId: TEST_FLEET_ID,
      branchId: Number(TEST_BRANCH_ID),
      branchName: 'Main Branch',
      categoryName: 'Sedan',
      isActive: true,
      url: 'assets/images/car-placeholder.svg',
    },
  ],
  customers: [
    {
      id: ids.customer,
      nameAr: 'أحمد محمد',
      nameEn: 'Ahmed Mohammed',
      firstMobileNumber: '+966500000000',
      fleetId: TEST_FLEET_ID,
      isActive: true,
    },
  ],
  financialYears: [
    {
      id: ids.financialYear,
      nameAr: 'السنة المالية 2026',
      nameEn: 'Financial Year 2026',
      startDate: '2026-01-01T00:00:00',
      endDate: '2026-12-31T23:59:59',
      isActive: true,
      fleetId: TEST_FLEET_ID,
    },
  ],
  journals: [
    {
      id: ids.journal,
      date: '2026-05-01T10:00:00',
      node: 'قيد اختبار متزن',
      operationType: 1,
      status: 1,
      journalType: 1,
      debtir: 100,
      credit: 100,
      balannce: 0,
      idBranch: Number(TEST_BRANCH_ID),
      idFinancialYear: ids.financialYear,
      fleetId: TEST_FLEET_ID,
      details: [
        {
          idCounting: ids.countingCash,
          debtir: 100,
          credit: 0,
          balannce: 100,
          node: 'Cash side',
        },
        {
          idCounting: ids.countingRevenue,
          debtir: 0,
          credit: 100,
          balannce: -100,
          node: 'Revenue side',
        },
      ],
    },
  ],
  banks: [
    {
      id: '501',
      nameAr: 'البنك الرئيسي',
      nameEn: 'Main Bank',
      accountNumber: 'SA0001',
      currentBalance: 12000,
      fleetId: TEST_FLEET_ID,
      isActive: true,
    },
  ],
  cashAccounts: [
    {
      id: '601',
      nameAr: 'صندوق الفرع الرئيسي',
      nameEn: 'Main Branch Cash',
      currentBalance: 5000,
      fleetId: TEST_FLEET_ID,
      isActive: true,
    },
  ],
  paymentCounts: [
    {
      id: '701',
      bondNumber: 'REC-001',
      bondType: 1,
      amount: 250,
      date: '2026-05-01T10:00:00',
      statement: 'دفعة تأجير',
      fleetId: TEST_FLEET_ID,
    },
  ],
};

export async function installApiMocks(page: Page): Promise<void> {
  await page.route('**/Api/V1/CarRentalManagament/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(resolveApiResponse(route)),
    });
  });
}

function result(data: unknown): Record<string, unknown> {
  return {
    data,
    succeeded: true,
    errors: [],
    propertyErrors: {},
    httpStatusCode: 200,
  };
}

function paginated(items: unknown[]): Record<string, unknown> {
  return result({
    items,
    pageNumber: 1,
    pageSize: 10,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / 10)),
  });
}

function resolveApiResponse(route: Route): Record<string, unknown> {
  const request = route.request();
  const url = new URL(request.url());
  const path = url.pathname.toLowerCase();
  const method = request.method().toUpperCase();

  if (method !== 'GET') {
    return result(method === 'DELETE' || path.includes('softdelete') ? true : { id: 'created-by-playwright' });
  }

  if (path.includes('/counting/paginated')) return paginated(mockData.countings);
  if (path.includes('/counting/list')) return result(mockData.countings);
  if (path.includes('/counting/')) return result(mockData.countings[1]);
  if (path.includes('/journal/paginated')) return paginated(mockData.journals);
  if (path.includes('/journal/') && path.includes('/details/')) return result(mockData.journals[0].details);
  if (path.includes('/journal/')) return result(mockData.journals[0]);
  if (path.includes('/journal/list')) return result(mockData.journals);
  if (path.includes('/vehicle/getvehiclestatuscounts') || path.includes('/vehicle/statuscounts')) {
    return result({
      totalCount: mockData.vehicles.length,
      statusCounts: [{ status: 'Available', statusDisplayName: 'Available', count: mockData.vehicles.length }],
    });
  }
  if (path.includes('/vehicle/paginated')) return paginated(mockData.vehicles);
  if (path.includes('/vehicle/list')) return result(mockData.vehicles);
  if (path.includes('/vehicle/')) return result(mockData.vehicles[0]);
  if (path.includes('/branch/paginated')) return paginated(mockData.branches);
  if (path.includes('/branch/list')) return result(mockData.branches);
  if (path.includes('/branch/')) return result(mockData.branches[0]);
  if (path.includes('/customer/paginated')) return paginated(mockData.customers);
  if (path.includes('/customer/list')) return result(mockData.customers);
  if (path.includes('/customer/')) return result(mockData.customers[0]);
  if (path.includes('/financialyear/paginated') || path.includes('/financial-year/paginated')) {
    return paginated(mockData.financialYears);
  }
  if (path.includes('/financialyear/list') || path.includes('/financial-year/list')) return result(mockData.financialYears);
  if (path.includes('/bank/paginated')) return paginated(mockData.banks);
  if (path.includes('/bank/list')) return result(mockData.banks);
  if (path.includes('/cash') && path.includes('/paginated')) return paginated(mockData.cashAccounts);
  if (path.includes('/cash') && path.includes('/list')) return result(mockData.cashAccounts);
  if (path.includes('/paymentcount') && path.includes('/paginated')) return paginated(mockData.paymentCounts);
  if (path.includes('/paymentcount') && path.includes('/list')) return result(mockData.paymentCounts);
  if (path.includes('/categoryvehicle') && path.includes('/paginated')) return paginated([]);
  if (path.includes('/categoryvehicle') && path.includes('/list')) return result([]);
  if (path.includes('/booking') && path.includes('/paginated')) return paginated([]);
  if (path.includes('/subscription') && path.includes('/paginated')) return paginated([]);
  if (path.includes('/trafficviolation') && path.includes('/paginated')) return paginated([]);
  if (path.includes('/role') || path.includes('/privilege') || path.includes('/user') || path.includes('/fleet')) {
    return paginated([]);
  }

  return result([]);
}
