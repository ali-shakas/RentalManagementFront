import { Injectable, inject } from '@angular/core';

import { catchError, map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import {
  CountingEntry,
  CreateCountingEntryRequest,
  UpdateCountingEntryRequest,
} from '../../models/counting/counting-entry.model';
import { normalizeCountingEntry } from '../../models/counting/counting-entry.normalizer';

@Injectable({
  providedIn: 'root',
})
export class CountingEntryService {
  private api = inject(BaseService);
  private readonly base = 'Counting';

  getList(fleetId?: string | null): Observable<CountingEntry[]> {
    return this.api
      .getData<unknown[]>(`${this.base}/List`, {
        ...buildFleetQueryParams(fleetId, 'both'),
      })
      .pipe(map(items => (items ?? []).map(normalizeCountingEntry)));
  }

  getById(id: string, fleetId: string): Observable<CountingEntry> {
    const encodedId = encodeURIComponent(id);
    const encodedFleetId = encodeURIComponent(fleetId);
    return this.api
      .getData<unknown>(`${this.base}/${encodedId}/${encodedFleetId}`)
      .pipe(map(item => normalizeCountingEntry(item)));
  }

  getPaginated(params: {
    fleetId?: string | null;
    pageSize?: number;
    pageNumber?: number;
    search?: string;
    orderByDirection?: string;
    orderBy?: 'CreatedAt' | 'CountingNumber' | string;
  }): Observable<unknown> {
    const fleetId = params.fleetId?.trim();
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      FleetId: fleetId || undefined,
      PageSize: params.pageSize,
      PageNumber: params.pageNumber,
      Search: params.search,
      OrderByDirection: params.orderByDirection,
      OrderBy: params.orderBy,
    });
  }

  create(payload: CreateCountingEntryRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, this.toCreateApiPayload(payload));
  }

  update(payload: UpdateCountingEntryRequest): Observable<unknown> {
    const requestBody = this.toUpdateApiPayload(payload);
    return this.api.putData<unknown>(`${this.base}/${encodeURIComponent(payload.id)}`, requestBody);
  }

  softDelete(id: string | number): Observable<boolean> {
    const encodedId = encodeURIComponent(String(id));
    return this.api.deleteData<boolean>(`${this.base}/${encodedId}?id=${encodedId}`).pipe(
      catchError(() => this.api.deleteData<boolean>(`${this.base}/${encodedId}`)),
      catchError(() => this.api.deleteData<boolean>(`${this.base}?id=${encodedId}`)),
      catchError(() => this.api.deleteData<boolean>(`${this.base}/SoftDelete/${encodedId}`)),
      catchError(() => this.api.patchData<boolean>(`${this.base}/SoftDelete/${encodedId}`, {})),
    );
  }

  private toCreateApiPayload(payload: CreateCountingEntryRequest): Record<string, unknown> {
    return {
      countingNumber: payload.countingNumber,
      CountingNumber: payload.countingNumber,
      countingMain: payload.countingMain,
      CountingMain: payload.countingMain,
      countingType: payload.countingType,
      CountingType: payload.countingType,
      reportNumber: payload.reportNumber,
      ReportNumber: payload.reportNumber,
      countingLevel: payload.countingLevel,
      CountingLevel: payload.countingLevel,
      balannce: payload.balannce,
      Balannce: payload.balannce,
      nameAr: payload.nameAr,
      NameAr: payload.nameAr,
      nameEn: payload.nameEn,
      NameEn: payload.nameEn,
      fleetId: payload.fleetId,
      FleetId: payload.fleetId,
    };
  }

  private toUpdateApiPayload(payload: UpdateCountingEntryRequest): Record<string, unknown> {
    const requestBody: Record<string, unknown> = {
      id: payload.id,
      countingNumber: payload.countingNumber,
      CountingNumber: payload.countingNumber,
      countingMain: payload.countingMain,
      CountingMain: payload.countingMain,
      countingType: payload.countingType,
      CountingType: payload.countingType,
      reportNumber: payload.reportNumber,
      ReportNumber: payload.reportNumber,
      countingLevel: payload.countingLevel,
      CountingLevel: payload.countingLevel,
      balannce: payload.balannce,
      Balannce: payload.balannce,
      nameAr: payload.nameAr,
      NameAr: payload.nameAr,
      nameEn: payload.nameEn,
      NameEn: payload.nameEn,
      fleetId: payload.fleetId,
      FleetId: payload.fleetId,
    };

    if (payload.debtir !== undefined && payload.debtir !== null) {
      requestBody['debtir'] = payload.debtir;
      requestBody['Debtir'] = payload.debtir;
    }

    if (payload.credit !== undefined && payload.credit !== null) {
      requestBody['credit'] = payload.credit;
      requestBody['Credit'] = payload.credit;
    }

    return requestBody;
  }
}
