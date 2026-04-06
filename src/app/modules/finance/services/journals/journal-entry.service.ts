import { Injectable, inject } from '@angular/core';

import { map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import {
  CreateJournalEntryRequest,
  JournalDetailLineRequest,
  JournalEntry,
} from '../../models/journals/journal-entry.model';
import { normalizeJournalEntry } from '../../models/journals/journal-entry.normalizer';

@Injectable({
  providedIn: 'root',
})
export class JournalEntryService {
  private api = inject(BaseService);
  private readonly base = 'Journal';

  getList(fleetId?: string | null): Observable<JournalEntry[]> {
    return this.api
      .getData<unknown[]>(`${this.base}/List`, {
        ...buildFleetQueryParams(fleetId, 'both'),
      })
      .pipe(map(items => (items ?? []).map(normalizeJournalEntry)));
  }

  create(payload: CreateJournalEntryRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, this.toApiPayload(payload));
  }

  private toApiPayload(payload: CreateJournalEntryRequest): Record<string, unknown> {
    const details = payload.details.map((line, index) => this.toApiDetailLine(line, index));

    return {
      date: payload.date,
      Date: payload.date,
      node: payload.node,
      Node: payload.node,
      journalType: payload.journalType,
      JournalType: payload.journalType,
      debtir: payload.debtir,
      Debtir: payload.debtir,
      credit: payload.credit,
      Credit: payload.credit,
      balannce: payload.balannce,
      Balannce: payload.balannce,
      operationType: payload.operationType,
      OperationType: payload.operationType,
      status: payload.status,
      Status: payload.status,
      isSystemOperation: payload.isSystemOperation,
      IsSystemOperation: payload.isSystemOperation,
      idBranch: payload.idBranch,
      IdBranch: payload.idBranch,
      fleetId: payload.fleetId,
      FleetId: payload.fleetId,
      details,
      Details: details,
      journalDetails: details,
      JournalDetails: details,
    };
  }

  private toApiDetailLine(line: JournalDetailLineRequest, index: number): Record<string, unknown> {
    const parsedCountingId = Number(line.countingId);
    const normalizedCountingId =
      Number.isFinite(parsedCountingId) && parsedCountingId > 0
        ? parsedCountingId
        : (line.countingNumber ?? 0);
    const balance = (line.debtir ?? 0) - (line.credit ?? 0);

    return {
      idCounting: normalizedCountingId,
      IdCounting: normalizedCountingId,
      countingId: normalizedCountingId,
      CountingId: normalizedCountingId,
      countingNumber: line.countingNumber,
      CountingNumber: line.countingNumber,
      debtir: line.debtir,
      Debtir: line.debtir,
      credit: line.credit,
      Credit: line.credit,
      balannce: balance,
      Balannce: balance,
      node: line.node,
      Node: line.node,
      lineOrder: index + 1,
      LineOrder: index + 1,
    };
  }
}
