import { Injectable, inject } from '@angular/core';

import { map, Observable } from 'rxjs';
import { PaginatedAggregatorResponse } from '../../../../core/interfaces';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import { normalizePaginatedResponse } from '../../../../shared/utils/paginated-response.normalizer';
import {
  CreateJournalEntryRequest,
  JournalEntry,
  JournalEntryPaginatedRequest,
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

  getPaginated(params: JournalEntryPaginatedRequest): Observable<PaginatedAggregatorResponse<JournalEntry>> {
    const normalizedDirection = params.orderByDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return this.api
      .getData<unknown>(`${this.base}/Paginated`, {
        PageSize: params.pageSize,
        PageNumber: params.pageNumber,
        FleetId: params.fleetId ?? undefined,
        BRANCHID: params.branchId ?? undefined,
        Status: params.status ?? undefined,
        JournalType: params.journalType ?? undefined,
        OperationType: params.operationType ?? undefined,
        Search: params.search?.trim() || undefined,
        DateFrom: params.dateFrom || undefined,
        DateTo: params.dateTo || undefined,
        OrderByDirection: params.orderByDirection ? normalizedDirection : undefined,
        OrderBy: params.orderBy ?? undefined,
        pageSize: params.pageSize,
        pageNumber: params.pageNumber,
        fleetId: params.fleetId ?? undefined,
        branchId: params.branchId ?? undefined,
        status: params.status ?? undefined,
        journalType: params.journalType ?? undefined,
        operationType: params.operationType ?? undefined,
        search: params.search?.trim() || undefined,
        dateFrom: params.dateFrom || undefined,
        dateTo: params.dateTo || undefined,
        orderByDirection: params.orderByDirection ? normalizedDirection.toLowerCase() : undefined,
        orderBy: params.orderBy ?? undefined,
      })
      .pipe(map(response => normalizePaginatedResponse(response, normalizeJournalEntry)));
  }

  getById(id: string, fleetId: string): Observable<JournalEntry> {
    const encodedId = encodeURIComponent(String(id).trim());
    const encodedFleetId = encodeURIComponent(String(fleetId).trim());
    return this.api
      .getData<unknown>(`${this.base}/${encodedId}/${encodedFleetId}`)
      .pipe(
        map(item => {
          const source = this.unwrapPayload(this.coerceToRecord(item));
          return normalizeJournalEntry(source);
        }),
      );
  }

  getByIdWithDetails(
    id: string,
    fleetId: string,
  ): Observable<{ entry: JournalEntry; details: Array<Record<string, unknown>> }> {
    const encodedId = encodeURIComponent(String(id).trim());
    const encodedFleetId = encodeURIComponent(String(fleetId).trim());
    return this.api.getData<unknown>(`${this.base}/${encodedId}/${encodedFleetId}`).pipe(
      map(response => {
        const source = this.unwrapPayload(this.coerceToRecord(response));
        return {
          entry: normalizeJournalEntry(source),
          details: this.extractDetailsArray(source),
        };
      }),
    );
  }

  getDetailsByJournalId(
    journalId: string,
    fleetId: string,
  ): Observable<Array<Record<string, unknown>>> {
    const encodedId = encodeURIComponent(String(journalId).trim());
    const encodedFleetId = encodeURIComponent(String(fleetId).trim());
    return this.api
      .getData<unknown>(`${this.base}/${encodedId}/Details/${encodedFleetId}`)
      .pipe(
        map(response => {
          if (typeof response === 'string') {
            const parsed = this.tryParseJson(response);
            if (Array.isArray(parsed)) {
              return parsed as Array<Record<string, unknown>>;
            }
            if (parsed && typeof parsed === 'object') {
              return this.extractDetailsArray(parsed as Record<string, unknown>);
            }
          }
          if (Array.isArray(response)) {
            return response as Array<Record<string, unknown>>;
          }
          const source = this.coerceToRecord(response);
          return this.extractDetailsArray(source);
        }),
      );
  }

  private coerceToRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    if (typeof value === 'string') {
      const parsed = this.tryParseJson(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    }
    return {};
  }

  private tryParseJson(value: string): unknown {
    const text = String(value ?? '').trim();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  private extractDetailsArray(source: Record<string, unknown>): Array<Record<string, unknown>> {
    const candidates: unknown[] = [
      source['details'],
      source['Details'],
      source['journalDetails'],
      source['JournalDetails'],
      source['detailLines'],
      source['DetailLines'],
      source['items'],
      source['Items'],
      source['data'],
      source['Data'],
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Array<Record<string, unknown>>;
      }
      if (candidate && typeof candidate === 'object') {
        const nested = candidate as Record<string, unknown>;
        const nestedItems =
          nested['items'] ??
          nested['Items'] ??
          nested['data'] ??
          nested['Data'] ??
          nested['details'] ??
          nested['Details'];
        if (Array.isArray(nestedItems)) {
          return nestedItems as Array<Record<string, unknown>>;
        }
      }
    }

    return [];
  }

  private unwrapPayload(source: Record<string, unknown>): Record<string, unknown> {
    const payload = source['data'] ?? source['Data'] ?? source['result'] ?? source['Result'];
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }
    return source;
  }

  create(payload: CreateJournalEntryRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, {
      date: payload.date,
      node: payload.node,
      journalType: payload.journalType,
      debtir: payload.debtir,
      credit: payload.credit,
      balannce: payload.balannce,
      operationType: payload.operationType,
      status: payload.status,
      isSystemOperation: payload.isSystemOperation ?? false,
      idFinancialYear: payload.idFinancialYear,
      idBranch: payload.idBranch,
      fleetId: payload.fleetId,
      details: payload.details.map(line => ({
        idCounting: line.idCounting,
        debtir: line.debtir,
        credit: line.credit,
        balannce: line.balannce,
        node: line.node,
        status: line.status ?? null,
        idVehicle: line.idVehicle ?? null,
        customerId: line.customerId ?? null,
      })),
    });
  }
}
