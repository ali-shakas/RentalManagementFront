import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { User, UserCreateRequest, UserUpdateRequest, UserPrivilegesRequest, PaginatedResponse, PaginatedRequest } from '../../models';
import { BaseService } from '../../../../shared/services/base/base.service';
import { normalizePaginatedResponse, normalizeUser } from '../../../../shared/utils/api-normalizers';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(BaseService);

  private readonly base = 'User';

  getList(status?: string): Observable<User[]> {
    return this.api.getData<unknown[]>(`${this.base}/user-list`, {
      status,
      Status: status,
    }).pipe(map(items => (items ?? []).map(normalizeUser)));
  }

  getPaginated(params: PaginatedRequest): Observable<PaginatedResponse<User>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search,
    }).pipe(map(response => normalizePaginatedResponse(response, normalizeUser)));
  }

  getById(id: string): Observable<User> {
    return this.api.getData<unknown>(`${this.base}/by-id`, { id }).pipe(map(normalizeUser));
  }

  create(body: UserCreateRequest): Observable<unknown> {
    return this.api.postData(`${this.base}/create`, body);
  }

  update(body: UserUpdateRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/update`, body);
  }

  updatePrivileges(body: UserPrivilegesRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/update-user-privileges`, body);
  }
}



