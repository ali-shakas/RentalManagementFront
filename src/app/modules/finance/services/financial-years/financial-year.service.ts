import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import { CreateFinancialYearRequest, FinancialYear } from '../../models/financial-years/financial-year.model';
import { normalizeFinancialYear } from '../../models/financial-years/financial-year.normalizer';

@Injectable({
  providedIn: 'root',
})
export class FinancialYearService {
  private api = inject(BaseService);
  private readonly base = 'FinancialYear';

  getList(fleetId?: string | null): Observable<FinancialYear[]> {
    return this.api.getData<unknown[]>(`${this.base}/List`, {
      ...buildFleetQueryParams(fleetId, 'both'),
    }).pipe(
      map(items => (items ?? []).map(normalizeFinancialYear)),
    );
  }

  create(payload: CreateFinancialYearRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, payload);
  }
}

