export interface JournalEntry {
  id: string;
  journalNumper?: number;
  date?: string;
  node?: string;
  balannce?: number;
  isManual?: boolean;
}

export interface JournalDetailLineRequest {
  countingId: string;
  countingNumber?: number;
  debtir: number;
  credit: number;
  node?: string;
}

export interface CreateJournalEntryRequest {
  date: string;
  node: string;
  journalType: boolean;
  debtir: number;
  credit: number;
  balannce: number;
  operationType: number;
  status: number;
  isSystemOperation: boolean;
  idBranch: number;
  fleetId: string;
  details: JournalDetailLineRequest[];
}

