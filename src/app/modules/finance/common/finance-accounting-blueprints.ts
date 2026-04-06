export interface CoreCountingAccountTemplate {
  key: string;
  countingNumber: number;
  parentCountingNumber: number;
  countingType: number;
  reportNumber: number;
  countingLevel: number;
  nameAr: string;
  nameEn: string;
}

export interface CountingAccountCandidate {
  countingNumber?: number;
  countingType?: number;
  nameAr?: string;
  nameEn?: string;
}

export type VoucherAccountingPurpose =
  | 'rental_revenue'
  | 'booking_advance'
  | 'security_deposit'
  | 'security_refund'
  | 'late_fee'
  | 'damage_fee';

export type VoucherCollectionChannel = 'cash' | 'bank';

export interface VoucherFlowPreview {
  debit: CoreCountingAccountTemplate;
  credit: CoreCountingAccountTemplate;
}

const ROOT_ACCOUNTS: ReadonlyArray<CoreCountingAccountTemplate> = [
  {
    key: 'assets_root',
    countingNumber: 1000,
    parentCountingNumber: 0,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 1,
    nameAr: 'الأصول',
    nameEn: 'Assets',
  },
  {
    key: 'liabilities_root',
    countingNumber: 2000,
    parentCountingNumber: 0,
    countingType: 2,
    reportNumber: 2,
    countingLevel: 1,
    nameAr: 'الالتزامات',
    nameEn: 'Liabilities',
  },
  {
    key: 'equity_root',
    countingNumber: 3000,
    parentCountingNumber: 0,
    countingType: 3,
    reportNumber: 3,
    countingLevel: 1,
    nameAr: 'حقوق الملكية',
    nameEn: 'Equity',
  },
  {
    key: 'revenue_root',
    countingNumber: 4000,
    parentCountingNumber: 0,
    countingType: 4,
    reportNumber: 4,
    countingLevel: 1,
    nameAr: 'الإيرادات',
    nameEn: 'Revenue',
  },
  {
    key: 'expenses_root',
    countingNumber: 5000,
    parentCountingNumber: 0,
    countingType: 5,
    reportNumber: 5,
    countingLevel: 1,
    nameAr: 'المصروفات',
    nameEn: 'Expenses',
  },
];

const OPERATIONAL_ACCOUNTS: ReadonlyArray<CoreCountingAccountTemplate> = [
  {
    key: 'cash',
    countingNumber: 1101,
    parentCountingNumber: 1000,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 2,
    nameAr: 'الصندوق',
    nameEn: 'Cash',
  },
  {
    key: 'bank',
    countingNumber: 1102,
    parentCountingNumber: 1000,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 2,
    nameAr: 'البنك',
    nameEn: 'Bank',
  },
  {
    key: 'customers',
    countingNumber: 1201,
    parentCountingNumber: 1000,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 2,
    nameAr: 'العملاء',
    nameEn: 'Customers',
  },
  {
    key: 'rental_cars',
    countingNumber: 1501,
    parentCountingNumber: 1000,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 2,
    nameAr: 'السيارات المعدة للتأجير',
    nameEn: 'Rental Vehicles',
  },
  {
    key: 'accumulated_depreciation',
    countingNumber: 1591,
    parentCountingNumber: 1000,
    countingType: 1,
    reportNumber: 1,
    countingLevel: 2,
    nameAr: 'مجمع إهلاك السيارات',
    nameEn: 'Accumulated Depreciation - Vehicles',
  },
  {
    key: 'booking_advance',
    countingNumber: 2201,
    parentCountingNumber: 2000,
    countingType: 2,
    reportNumber: 2,
    countingLevel: 2,
    nameAr: 'عربون حجوزات العملاء',
    nameEn: 'Customer Booking Advances',
  },
  {
    key: 'security_deposit',
    countingNumber: 2202,
    parentCountingNumber: 2000,
    countingType: 2,
    reportNumber: 2,
    countingLevel: 2,
    nameAr: 'تأمينات مستلمة من العملاء',
    nameEn: 'Customer Security Deposits',
  },
  {
    key: 'daily_rental_revenue',
    countingNumber: 4101,
    parentCountingNumber: 4000,
    countingType: 4,
    reportNumber: 4,
    countingLevel: 2,
    nameAr: 'إيرادات التأجير اليومي',
    nameEn: 'Daily Rental Revenue',
  },
  {
    key: 'monthly_rental_revenue',
    countingNumber: 4102,
    parentCountingNumber: 4000,
    countingType: 4,
    reportNumber: 4,
    countingLevel: 2,
    nameAr: 'إيرادات التأجير الشهري',
    nameEn: 'Monthly Rental Revenue',
  },
  {
    key: 'late_fees_revenue',
    countingNumber: 4201,
    parentCountingNumber: 4000,
    countingType: 4,
    reportNumber: 4,
    countingLevel: 2,
    nameAr: 'رسوم التأخير',
    nameEn: 'Late Fees Revenue',
  },
  {
    key: 'damage_fees_revenue',
    countingNumber: 4202,
    parentCountingNumber: 4000,
    countingType: 4,
    reportNumber: 4,
    countingLevel: 2,
    nameAr: 'رسوم الأضرار',
    nameEn: 'Damage Fees Revenue',
  },
  {
    key: 'vehicle_maintenance_expense',
    countingNumber: 5101,
    parentCountingNumber: 5000,
    countingType: 5,
    reportNumber: 5,
    countingLevel: 2,
    nameAr: 'مصروف صيانة السيارات',
    nameEn: 'Vehicle Maintenance Expense',
  },
  {
    key: 'vehicle_insurance_expense',
    countingNumber: 5102,
    parentCountingNumber: 5000,
    countingType: 5,
    reportNumber: 5,
    countingLevel: 2,
    nameAr: 'مصروف تأمين السيارات',
    nameEn: 'Vehicle Insurance Expense',
  },
  {
    key: 'vehicle_depreciation_expense',
    countingNumber: 5103,
    parentCountingNumber: 5000,
    countingType: 5,
    reportNumber: 5,
    countingLevel: 2,
    nameAr: 'مصروف إهلاك السيارات',
    nameEn: 'Vehicle Depreciation Expense',
  },
  {
    key: 'operating_expenses',
    countingNumber: 5201,
    parentCountingNumber: 5000,
    countingType: 5,
    reportNumber: 5,
    countingLevel: 2,
    nameAr: 'مصروفات تشغيل',
    nameEn: 'Operating Expenses',
  },
];

export const CORE_COUNTING_ACCOUNT_TEMPLATES: ReadonlyArray<CoreCountingAccountTemplate> = [
  ...ROOT_ACCOUNTS,
  ...OPERATIONAL_ACCOUNTS,
];

const TEMPLATE_BY_KEY = new Map(
  CORE_COUNTING_ACCOUNT_TEMPLATES.map(template => [template.key, template]),
);

const CASH_NUMBER = TEMPLATE_BY_KEY.get('cash')?.countingNumber ?? 1101;
const BANK_NUMBER = TEMPLATE_BY_KEY.get('bank')?.countingNumber ?? 1102;

export function getCoreCountingAccountTemplates(): ReadonlyArray<CoreCountingAccountTemplate> {
  return CORE_COUNTING_ACCOUNT_TEMPLATES;
}

export function getCoreTemplateByKey(key: string): CoreCountingAccountTemplate | undefined {
  return TEMPLATE_BY_KEY.get(key);
}

export function getOperationalCountingAccountTemplates(): ReadonlyArray<CoreCountingAccountTemplate> {
  return OPERATIONAL_ACCOUNTS;
}

export function resolveVoucherFlow(
  purpose: VoucherAccountingPurpose,
  channel: VoucherCollectionChannel,
): VoucherFlowPreview {
  const cashOrBankAccount = channel === 'bank' ? 'bank' : 'cash';

  switch (purpose) {
    case 'booking_advance':
      return {
        debit: requireTemplate(cashOrBankAccount),
        credit: requireTemplate('booking_advance'),
      };
    case 'security_deposit':
      return {
        debit: requireTemplate(cashOrBankAccount),
        credit: requireTemplate('security_deposit'),
      };
    case 'security_refund':
      return {
        debit: requireTemplate('security_deposit'),
        credit: requireTemplate(cashOrBankAccount),
      };
    case 'late_fee':
      return {
        debit: requireTemplate('customers'),
        credit: requireTemplate('late_fees_revenue'),
      };
    case 'damage_fee':
      return {
        debit: requireTemplate('customers'),
        credit: requireTemplate('damage_fees_revenue'),
      };
    case 'rental_revenue':
    default:
      return {
        debit: requireTemplate(cashOrBankAccount),
        credit: requireTemplate('daily_rental_revenue'),
      };
  }
}

export function isCashCountingCandidate(entry: CountingAccountCandidate): boolean {
  if (!entry) {
    return false;
  }

  if (Number(entry.countingNumber) === CASH_NUMBER) {
    return true;
  }

  if (Number(entry.countingType ?? 0) !== 1) {
    return false;
  }

  const searchable = normalizeSearchableName(entry);
  return searchable.includes('cash') || searchable.includes('صندوق');
}

export function isBankCountingCandidate(entry: CountingAccountCandidate): boolean {
  if (!entry) {
    return false;
  }

  if (Number(entry.countingNumber) === BANK_NUMBER) {
    return true;
  }

  if (Number(entry.countingType ?? 0) !== 1) {
    return false;
  }

  const searchable = normalizeSearchableName(entry);
  return searchable.includes('bank') || searchable.includes('بنك');
}

function requireTemplate(key: string): CoreCountingAccountTemplate {
  const template = TEMPLATE_BY_KEY.get(key);
  if (!template) {
    throw new Error(`Missing core accounting template for key: ${key}`);
  }

  return template;
}

function normalizeSearchableName(entry: CountingAccountCandidate): string {
  return `${entry.nameAr ?? ''} ${entry.nameEn ?? ''}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
