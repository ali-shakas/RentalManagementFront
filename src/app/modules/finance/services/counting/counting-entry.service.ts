import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import { CountingEntry, CreateCountingEntryRequest } from '../../models/counting/counting-entry.model';
import { normalizeCountingEntry } from '../../models/counting/counting-entry.normalizer';

@Injectable({
  providedIn: 'root',
})
export class CountingEntryService {
  private api = inject(BaseService);
  private readonly base = 'Counting';

  getList(fleetId?: string | null): Observable<CountingEntry[]> {
    return this.api.getData<unknown[]>(`${this.base}/List`, {
      ...buildFleetQueryParams(fleetId, 'both'),
    }).pipe(
      map(items => (items ?? []).map(normalizeCountingEntry)),
    );
  }

  create(payload: CreateCountingEntryRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, payload);
  }
}

