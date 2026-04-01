import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import { CreateJournalEntryRequest, JournalEntry } from '../../models/journals/journal-entry.model';
import { normalizeJournalEntry } from '../../models/journals/journal-entry.normalizer';

@Injectable({
  providedIn: 'root',
})
export class JournalEntryService {
  private api = inject(BaseService);
  private readonly base = 'Journal';

  getList(fleetId?: string | null): Observable<JournalEntry[]> {
    return this.api.getData<unknown[]>(`${this.base}/List`, {
      ...buildFleetQueryParams(fleetId, 'both'),
    }).pipe(
      map(items => (items ?? []).map(normalizeJournalEntry)),
    );
  }

  create(payload: CreateJournalEntryRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, payload);
  }
}

