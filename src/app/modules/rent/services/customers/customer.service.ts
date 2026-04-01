import { Injectable, inject } from '@angular/core';

import { Observable, catchError, map, throwError } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams, normalizeFleetId } from '../../../../shared/utils/fleet-query.utils';
import { normalizePaginatedResponse } from '../../../../shared/utils/paginated-response.normalizer';
import { Customer, CustomerFilters, CustomerUpsertRequest } from '../../models';
import { normalizeCustomer } from '../../models/customers/customer.normalizer';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private api = inject(BaseService);
  private readonly base = 'Customer';

  getPaginated(params: CustomerFilters): Observable<PaginatedAggregatorResponse<Customer>> {
    return this.api
      .getData<unknown>(`${this.base}/Paginated`, {
        ...buildFleetQueryParams(params.fleetId, 'both'),
        Search: params.search,
        search: params.search,
        isActive: params.isActive === '' ? undefined : params.isActive,
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      })
      .pipe(map(response => normalizePaginatedResponse(response, normalizeCustomer)));
  }

  getById(id: string, fleetId?: string | null): Observable<Customer> {
    const normalizedFleetId = normalizeFleetId(fleetId);
    if (!normalizedFleetId) {
      return this.getByIdFromList(id);
    }

    return this.api
      .getData<unknown>(`${this.base}/${id}/${normalizedFleetId}`, undefined, {
        suppressErrorToast: true,
      })
      .pipe(
        map(normalizeCustomer),
        catchError(error => this.getByIdFromList(id, normalizedFleetId, error)),
      );
  }

  create(body: CustomerUpsertRequest): Observable<unknown> {
    return this.api.postData(this.base, this.toApiPayload(body));
  }

  update(body: CustomerUpsertRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/${body.id}`, this.toApiPayload(body));
  }

  softDelete(id: string): Observable<unknown> {
    return this.api.patchData(`${this.base}/SoftDelete/${id}`, {});
  }

  private toApiPayload(body: CustomerUpsertRequest): Record<string, unknown> {
    return {
      id: body.id,
      nameAr: body.nameAr,
      nameEn: body.nameEn,
      firstMobileNumber: body.firstMobileNumber,
      secondMobileNumber: body.secondMobileNumber,
      thirdMobileNumber: body.thirdMobileNumber,
      address: body.address,
      licenceNo: body.licenceNo,
      idNationality: body.idNationality,
      dateIdNationality: body.dateIdNationality,
      birthDay: body.birthDay,
      plaseIdNationality: body.plaseIdNationality,
      plaseDrivinglicense: body.plaseDrivinglicense,
      nationality: body.nationality,
      dateDrivinglicense: body.dateDrivinglicense,
      dateDrivinglicenseHajri: body.dateDrivinglicenseHajri,
      taxRecord: body.taxRecord,
      email: body.email,
      idSubscriptionsOfCustomer: body.idSubscriptionsOfCustomer,
      fleetId: body.fleetId,
      notes: body.notes,
      isActive: body.isActive,
    };
  }

  private getByIdFromList(
    id: string,
    fleetId?: string,
    sourceError?: unknown,
  ): Observable<Customer> {
    return this.api
      .getData<unknown[]>(`${this.base}/List`, buildFleetQueryParams(fleetId, 'both'), {
        suppressErrorToast: true,
      })
      .pipe(
        map(items => (items ?? []).map(normalizeCustomer)),
        map(items => items.find(customer => String(customer.id) === String(id)) ?? null),
        map(customer => {
          if (!customer) {
            throw sourceError ?? new Error('Customer not found');
          }
          return customer;
        }),
        catchError(() => throwError(() => sourceError ?? new Error('Customer not found'))),
      );
  }
}
