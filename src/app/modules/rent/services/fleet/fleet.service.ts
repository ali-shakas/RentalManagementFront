import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import type { Fleet, FleetUpsertRequest, PaginatedRequest, PaginatedResponse } from '../../models';
import { normalizeFleet, normalizePaginatedResponse } from '../../../../shared/utils/api-normalizers';

@Injectable({
  providedIn: 'root',
})
export class FleetService {
  private api = inject(BaseService);

  private readonly base = 'Fleet';

  getPaginated(params: PaginatedRequest): Observable<PaginatedResponse<Fleet>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search,
    }).pipe(map(response => normalizePaginatedResponse(response, normalizeFleet)));
  }

  getById(id: string): Observable<Fleet> {
    return this.api.getData<unknown>(`${this.base}/${id}`).pipe(map(normalizeFleet));
  }

  create(body: FleetUpsertRequest): Observable<Fleet> {
    return this.api.postData<Fleet>(this.base, body);
  }

  update(body: FleetUpsertRequest & { id: string }): Observable<Fleet> {
    return this.api.putData<Fleet>(`${this.base}/${body.id}`, body);
  }
}




