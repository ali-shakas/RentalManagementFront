import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseService } from '../../../../shared/services/base/base.service';
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



