import { JournalEntry } from './journal-entry.model';
import { pick } from '../shared/finance-normalizer.utils';

export function normalizeJournalEntry(raw: unknown): JournalEntry {
  const source = (raw ?? {}) as Record<string, unknown>;
  const financialYear = (pick(source, 'financialYear', 'FinancialYear') ?? {}) as Record<string, unknown>;
  const branch = (pick(source, 'branch', 'Branch') ?? {}) as Record<string, unknown>;
  return {
    id: String(pick(source, 'id', 'Id', 'journalId', 'JournalId') ?? ''),
    journalNumper: pick<number>(source, 'journalNumper', 'JournalNumper'),
    date: pick<string>(source, 'date', 'Date'),
    node: pick<string>(source, 'node', 'Node'),
    journalType: pick<number | boolean>(source, 'journalType', 'JournalType'),
    status: pick<number>(source, 'status', 'Status'),
    debtir: pick<number>(source, 'debtir', 'Debtir'),
    credit: pick<number>(source, 'credit', 'Credit'),
    balannce: pick<number>(source, 'balannce', 'Balannce'),
    isManual: pick<boolean>(source, 'isManual', 'IsManual'),
    operationType: pick<number>(source, 'operationType', 'OperationType'),
    isSystemOperation: pick<boolean>(source, 'isSystemOperation', 'IsSystemOperation'),
    idFinancialYear: pick<string | number>(source, 'idFinancialYear', 'IdFinancialYear'),
    financialYearName:
      pick<string>(source, 'financialYearName', 'FinancialYearName', 'yearName', 'YearName') ??
      pick<string>(financialYear, 'name', 'Name'),
    idBranch: pick<number>(source, 'idBranch', 'IdBranch'),
    branchName: pick<string>(source, 'branchName', 'BranchName') ?? pick<string>(branch, 'nameAr', 'NameAr', 'nameEn', 'NameEn'),
    branchStreet: pick<string>(source, 'branchStreet', 'BranchStreet'),
    branchNeighborHood: pick<string>(source, 'branchNeighborHood', 'BranchNeighborHood'),
    branchBuldingNumber: pick<string>(source, 'branchBuldingNumber', 'BranchBuldingNumber'),
    branchCity: pick<string>(source, 'branchCity', 'BranchCity'),
    urllogo: pick<string>(source, 'urllogo', 'Urllogo', 'urlLogo', 'UrlLogo'),
    taxNumber: pick<string>(source, 'taxNumber', 'TaxNumber'),
    fleetId: pick<string>(source, 'fleetId', 'FleetId'),
  };
}

