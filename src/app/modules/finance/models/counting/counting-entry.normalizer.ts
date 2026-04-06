import { CountingEntry } from './counting-entry.model';
import { pick, toBoolean } from '../shared/finance-normalizer.utils';

function hasSoftDeleteMarker(value: unknown): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return false;
  }

  return ![
    '0001-01-01T00:00:00',
    '0001-01-01T00:00:00.0000000',
    '0001-01-01 00:00:00',
  ].includes(normalized);
}

export function normalizeCountingEntry(raw: unknown): CountingEntry {
  const source = (raw ?? {}) as Record<string, unknown>;
  const deletedAt = pick<string>(source, 'deletedAt', 'DeletedAt');
  const deletedBy = pick<string>(source, 'deletedBy', 'DeletedBy');
  const explicitIsDeleted = toBoolean(pick(source, 'isDeleted', 'IsDeleted'));

  return {
    id: String(pick(source, 'id', 'Id') ?? ''),
    countingNumber: pick<number>(source, 'countingNumber', 'CountingNumber'),
    countingMain: pick<number>(source, 'countingMain', 'CountingMain'),
    countingType: pick<number>(source, 'countingType', 'CountingType'),
    reportNumber: pick<number>(source, 'reportNumber', 'ReportNumber'),
    countingLevel: pick<number>(source, 'countingLevel', 'CountingLevel'),
    debtir: pick<number>(source, 'debtir', 'Debtir'),
    credit: pick<number>(source, 'credit', 'Credit'),
    nameAr: pick<string>(source, 'nameAr', 'NameAr'),
    nameEn: pick<string>(source, 'nameEn', 'NameEn'),
    balannce: pick<number>(source, 'balannce', 'Balannce'),
    isActive: toBoolean(pick(source, 'isActive', 'IsActive')),
    status: pick<string>(source, 'status', 'Status'),
    isDeleted: explicitIsDeleted ?? (hasSoftDeleteMarker(deletedAt) || hasSoftDeleteMarker(deletedBy)),
    deletedBy,
    deletedAt,
    createdAt: pick<string>(source, 'createdAt', 'CreatedAt'),
    updatedAt: pick<string>(source, 'updatedAt', 'UpdatedAt'),
  };
}

