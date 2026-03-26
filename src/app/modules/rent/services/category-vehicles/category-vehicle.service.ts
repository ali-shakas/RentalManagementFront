import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import {
  CategoryVehicle,
  CategoryVehicleFilters,
  CategoryVehicleUpsertRequest,
  PaginatedResponse,
} from '../../models';
import { normalizeCategoryVehicle, normalizePaginatedResponse } from '../../../../shared/utils/api-normalizers';

@Injectable({
  providedIn: 'root',
})
export class CategoryVehicleService {
  private api = inject(BaseService);
  private readonly base = 'CategoryVehicle';

  getPaginated(params: CategoryVehicleFilters): Observable<PaginatedResponse<CategoryVehicle>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      FleetId: params.fleetId,
      Fleetid: params.fleetId,
      fleetId: params.fleetId,
      fleetid: params.fleetId,
      Search: params.search,
      search: params.search,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    }).pipe(map(response => normalizePaginatedResponse(response, normalizeCategoryVehicle)));
  }

  getById(id: string, fleetId: string): Observable<CategoryVehicle> {
    return this.api.getData<unknown>(`${this.base}/${id}/${fleetId}`).pipe(map(normalizeCategoryVehicle));
  }

  create(body: CategoryVehicleUpsertRequest): Observable<unknown> {
    return this.api.postData(this.base, body);
  }

  update(body: CategoryVehicleUpsertRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/${body.id}`, body);
  }
}



