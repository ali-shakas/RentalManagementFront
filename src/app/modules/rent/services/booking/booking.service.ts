import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { Booking, BookingFilters, BookingUpsertRequest, PaginatedResponse } from '../../models';
import { normalizeBooking, normalizePaginatedResponse } from '../../../../shared/utils/api-normalizers';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private api = inject(BaseService);
  private readonly base = 'Booking';

  getPaginated(params: BookingFilters): Observable<PaginatedResponse<Booking>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      FleetId: params.fleetId,
      fleetId: params.fleetId,
      fleetid: params.fleetId,
      BranchId: params.branchId ?? undefined,
      branchId: params.branchId ?? undefined,
      BRANCHID: params.branchId ?? undefined,
      status: params.status || undefined,
      startDate: params.startDate,
      endDate: params.endDate,
      Search: params.search,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      search: params.search,
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
    }).pipe(map(response => normalizePaginatedResponse(response, normalizeBooking)));
  }

  getById(id: string, fleetId: string): Observable<Booking> {
    return this.api.getData<unknown>(`${this.base}/${id}/${fleetId}`).pipe(map(normalizeBooking));
  }

  create(body: BookingUpsertRequest): Observable<unknown> {
    return this.api.postData(this.base, body);
  }

  update(body: BookingUpsertRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/${body.id}`, body);
  }
}



