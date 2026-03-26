import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  ApiResponse,
  PrivilegeTypeLookup,
  PrivilegeTypeCreateRequest,
  PrivilegeTypeUpdateRequest,
  PrivilegeRoleItem,
  PaginatedResponse,
  PaginatedRequest,
} from '../../models';
import { BaseService } from '../../../../shared/services/base/base.service';
import { normalizePaginatedResponse, normalizePrivilege } from '../../../../shared/utils/api-normalizers';

@Injectable({
  providedIn: 'root',
})
export class PrivilegeService {
  private api = inject(BaseService);

  private readonly base = 'PrivilegeTypeLookup';

  getList(): Observable<PrivilegeTypeLookup[]> {
    return this.api.getData<unknown[]>(`${this.base}/privilegeTypeLookup-list`).pipe(
      map(items => (items ?? []).map(normalizePrivilege)),
    );
  }

  getById(id: string): Observable<PrivilegeTypeLookup> {
    return this.api.getData<unknown>(`${this.base}/by-id`, { id }).pipe(map(normalizePrivilege));
  }

  getPaginated(params: PaginatedRequest): Observable<ApiResponse<PaginatedResponse<PrivilegeTypeLookup>>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search,
    }).pipe(
      map(data => ({
        data: normalizePaginatedResponse(data, normalizePrivilege),
        succeeded: true,
        errors: [],
        propertyErrors: {},
        httpStatusCode: 200,
      })),
    );
  }

  getPrivilegesByRole(): Observable<PrivilegeRoleItem[]> {
    return this.api.getData<PrivilegeRoleItem[]>(`${this.base}/privileges-role`);
  }

  create(body: PrivilegeTypeCreateRequest): Observable<unknown> {
    return this.api.postData(`${this.base}/create`, body);
  }

  update(body: PrivilegeTypeUpdateRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/update`, body);
  }
}



