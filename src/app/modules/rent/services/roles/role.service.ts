import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ApiResponse,
  RoleLookup,
  RoleCreateRequest,
  RoleUpdateRequest,
  PaginatedResponse,
  PaginatedRequest,
} from '../../models';
import { BaseService } from '../../../../shared/services/base/base.service';
import { normalizePaginatedResponse, normalizeRole } from '../../../../shared/utils/api-normalizers';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private api = inject(BaseService);

  private readonly base = 'RoleLookup';

  getList(): Observable<RoleLookup[]> {
    return this.api.getData<unknown[]>(`${this.base}/roleLookup-list`).pipe(
      map(items => (items ?? []).map(normalizeRole)),
    );
  }

  getById(id: string): Observable<RoleLookup> {
    return this.api.getData<unknown>(`${this.base}/by-id`, { id }).pipe(map(normalizeRole));
  }

  getPaginated(params: PaginatedRequest): Observable<ApiResponse<PaginatedResponse<RoleLookup>>> {
    return this.api.get<unknown>(`${this.base}/Paginated`, {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search,
    }).pipe(
      map(response => ({
        ...response,
        data: normalizePaginatedResponse(response.data, normalizeRole),
      })),
    );
  }

  create(body: RoleCreateRequest): Observable<unknown> {
    return this.api.postData(`${this.base}/create`, body);
  }

  update(body: RoleUpdateRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/update`, body);
  }
}



