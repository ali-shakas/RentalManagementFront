import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams, normalizeFleetId } from '../../../../shared/utils/fleet-query.utils';
import {
  CategoryVehicle,
  CategoryVehicleFilters,
  CategoryVehicleUpsertRequest,
} from '../../models';
import { normalizePaginatedResponse } from '../../../../shared/utils/paginated-response.normalizer';
import { normalizeCategoryVehicle } from '../../models/category-vehicles/category-vehicle.normalizer';

@Injectable({
  providedIn: 'root',
})
export class CategoryVehicleService {
  private api = inject(BaseService);
  private readonly base = 'CategoryVehicle';

  getPaginated(params: CategoryVehicleFilters): Observable<PaginatedAggregatorResponse<CategoryVehicle>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      ...buildFleetQueryParams(params.fleetId, 'both'),
      Search: params.search,
      search: params.search,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    }).pipe(map(response => normalizePaginatedResponse(response, normalizeCategoryVehicle)));
  }

  getById(id: string, fleetId?: string | null): Observable<CategoryVehicle> {
    const normalizedFleetId = normalizeFleetId(fleetId);
    if (!normalizedFleetId) {
      return this.getByIdFromList(id);
    }

    return this.api.getData<unknown>(`${this.base}/${id}/${normalizedFleetId}`).pipe(
      map(normalizeCategoryVehicle),
      catchError(error => this.getByIdFromList(id, normalizedFleetId, error)),
    );
  }

  create(body: CategoryVehicleUpsertRequest): Observable<unknown> {
    return this.api.postData(this.base, body);
  }

  update(body: CategoryVehicleUpsertRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/${body.id}`, body);
  }

  private getByIdFromList(
    id: string,
    fleetId?: string,
    sourceError?: unknown,
  ): Observable<CategoryVehicle> {
    return this.api
      .getData<unknown[]>(`${this.base}/List`, buildFleetQueryParams(fleetId, 'both'), {
        suppressErrorToast: true,
      })
      .pipe(
        map(items => (items ?? []).map(normalizeCategoryVehicle)),
        map(items => items.find(item => String(item.id) === String(id))),
        map(item => {
          if (!item) {
            throw sourceError ?? new Error('Category vehicle not found');
          }
          return item;
        }),
        catchError(error => throwError(() => sourceError ?? error)),
      );
  }
}



