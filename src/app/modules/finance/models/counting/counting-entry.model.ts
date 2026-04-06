export interface CountingEntry {
  id: string;
  countingNumber?: number;
  countingMain?: number;
  countingType?: number;
  reportNumber?: number;
  countingLevel?: number;
  debtir?: number;
  credit?: number;
  nameAr?: string;
  nameEn?: string;
  balannce?: number;
  isActive?: boolean;
  status?: string;
  isDeleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCountingEntryRequest {
  countingNumber: number;
  countingMain: number;
  countingType: number;
  reportNumber: number;
  countingLevel: number;
  debtir?: number;
  credit?: number;
  balannce: number;
  nameAr: string;
  nameEn?: string;
  fleetId: string;
}

export interface UpdateCountingEntryRequest extends CreateCountingEntryRequest {
  id: string;
}

