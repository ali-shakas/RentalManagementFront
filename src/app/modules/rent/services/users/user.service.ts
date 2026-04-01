import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseRequestOptions } from '../../../../shared/services/base/base.service';
import { User, UserCreateRequest, UserUpdateRequest, UserPrivilegesRequest, PaginatedRequest } from '../../models';
import { BaseService } from '../../../../shared/services/base/base.service';
import { normalizePaginatedResponse } from '../../../../shared/utils/paginated-response.normalizer';
import { normalizeUser } from '../../models/users/user.normalizer';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(BaseService);

  private readonly base = 'User';

  getList(status?: string, options?: BaseRequestOptions, fleetId?: string): Observable<User[]> {
    return this.api.getData<unknown[]>(`${this.base}/user-list`, {
      Status: status,
      FleetId: fleetId,
    }, options).pipe(map(items => (items ?? []).map(normalizeUser)));
  }

  getPaginated(params: PaginatedRequest, options?: BaseRequestOptions): Observable<PaginatedAggregatorResponse<User>> {
    const silentOptions: BaseRequestOptions = {
      ...options,
      suppressErrorToast: true,
    };

    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      FleetId: params.fleetId,
    }, silentOptions).pipe(
      map(response => normalizePaginatedResponse(response, normalizeUser)),
      catchError(() =>
        this.getList(undefined, silentOptions, params.fleetId).pipe(
          map(users => this.paginateLocally(users, params)),
        ),
      ),
    );
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

  private paginateLocally(users: User[], params: PaginatedRequest): PaginatedAggregatorResponse<User> {
    const pageNumber = Math.max(1, Number(params.pageNumber || 1));
    const pageSize = Math.max(1, Number(params.pageSize || 10));
    const searchTerm = (params.search ?? '').trim().toLowerCase();

    const filteredUsers = searchTerm
      ? users.filter(user =>
          [user.userName, user.email, user.nameAr, user.nameEn]
            .filter(Boolean)
            .some(field => String(field).toLowerCase().includes(searchTerm)),
        )
      : users;

    const totalCount = filteredUsers.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
    const from = (pageNumber - 1) * pageSize;
    const items = filteredUsers.slice(from, from + pageSize);

    return {
      items,
      pageNumber,
      pageSize,
      totalCount,
      totalPages,
    };
  }
}



