import { Injectable, inject } from '@angular/core';

import { Observable, catchError, map, throwError } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseService } from '../../../../shared/services/base/base.service';
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
        FleetId: params.fleetId,
        Fleetid: params.fleetId,
        fleetId: params.fleetId,
        fleetid: params.fleetId,
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

  getById(id: string, fleetId: string): Observable<Customer> {
    return this.api
      .getData<unknown>(`${this.base}/${id}/${fleetId}`, undefined, { suppressErrorToast: true })
      .pipe(
        map(normalizeCustomer),
        catchError(error =>
          this.api
            .getData<unknown[]>(
              `${this.base}/List`,
              {
                FleetId: fleetId,
                Fleetid: fleetId,
                fleetId,
                fleetid: fleetId,
              },
              { suppressErrorToast: true },
            )
            .pipe(
              map(items => (items ?? []).map(normalizeCustomer)),
              map(items => items.find(customer => String(customer.id) === String(id)) ?? null),
              map(customer => {
                if (!customer) {
                  throw error;
                }
                return customer;
              }),
              catchError(() => throwError(() => error)),
            ),
        ),
      );
  }

  create(body: CustomerUpsertRequest): Observable<unknown> {
    return this.api.postData(this.base, this.toApiPayload(body));
  }

  update(body: CustomerUpsertRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/${body.id}`, this.toApiPayload(body));
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
}
