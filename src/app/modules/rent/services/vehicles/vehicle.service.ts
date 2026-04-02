import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseRequestOptions } from '../../../../shared/services/base/base.service';
import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams, normalizeFleetId } from '../../../../shared/utils/fleet-query.utils';
import { buildImageUploadPayload } from '../../../../shared/utils/image-upload.utils';
import { Vehicle, VehicleFilters, VehicleUpsertRequest } from '../../models';
import { normalizePaginatedResponse } from '../../../../shared/utils/paginated-response.normalizer';
import { normalizeVehicle } from '../../models/vehicles/vehicle.normalizer';
import { appendFormDataValue } from '../../../../shared/utils/form-data.utils';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private api = inject(BaseService);
  private readonly base = 'Vehicle';

  getPaginated(
    params: VehicleFilters,
    options?: BaseRequestOptions,
  ): Observable<PaginatedAggregatorResponse<Vehicle>> {
    return this.api.getData<unknown>(
      `${this.base}/Paginated`,
      {
        ...buildFleetQueryParams(params.fleetId, 'both'),
        BranchId: params.branchId ?? undefined,
        status: params.status || undefined,
        Search: params.search,
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        OrderBy: params.orderBy,
        OrderByDirection: params.orderByDirection,
        search: params.search,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        orderBy: params.orderBy,
        orderByDirection: params.orderByDirection,
      },
      options,
    ).pipe(map(response => normalizePaginatedResponse(response, normalizeVehicle)));
  }

  getById(id: string, fleetId?: string | null): Observable<Vehicle> {
    const normalizedFleetId = normalizeFleetId(fleetId);
    if (!normalizedFleetId) {
      return this.getByIdFromList(id);
    }

    return this.api.getData<unknown>(`${this.base}/${id}/${normalizedFleetId}`).pipe(
      map(normalizeVehicle),
      catchError(error => this.getByIdFromList(id, normalizedFleetId, error)),
    );
  }

  create(body: VehicleUpsertRequest): Observable<unknown> {
    return from(this.toFormData(body)).pipe(
      switchMap(payload => this.api.postData(this.base, payload)),
    );
  }

  update(body: VehicleUpsertRequest): Observable<unknown> {
    return from(this.toFormData(body)).pipe(
      switchMap(payload => this.api.putData(`${this.base}/${body.id}`, payload)),
    );
  }

  private async toFormData(body: VehicleUpsertRequest): Promise<FormData> {
    const imagePayload = await buildImageUploadPayload(body.image);
    const formData = new FormData();
    appendFormDataValue(formData, 'Color', body.color);
    appendFormDataValue(formData, 'InsuranceNumber', body.insuranceNumber);
    appendFormDataValue(formData, 'InsuranceType', body.insuranceType);
    appendFormDataValue(formData, 'InsuranceExpires', body.insuranceExpires);
    appendFormDataValue(formData, 'LicenseExpirationDate', body.licenseExpirationDate);
    appendFormDataValue(formData, 'InsurancePolicyNumber', body.insurancePolicyNumber);
    appendFormDataValue(formData, 'OperatinCard', body.operatinCard);
    appendFormDataValue(formData, 'ValidityCarRegistration', body.validityCarRegistration);
    appendFormDataValue(formData, 'FleetId', body.fleetId);
    appendFormDataValue(formData, 'BranchId', body.branchId);
    appendFormDataValue(formData, 'VIN', body.vin);
    appendFormDataValue(formData, 'YearMake', body.yearMake);
    appendFormDataValue(formData, 'IdCategoryVehicle', body.idCategoryVehicle);
    appendFormDataValue(formData, 'Engine', body.engine);
    appendFormDataValue(formData, 'SerialNumber', body.serialNumber);
    appendFormDataValue(formData, 'PlateNumber', body.plateNumber);
    appendFormDataValue(formData, 'CountKm', body.countKm);
    appendFormDataValue(formData, 'CapacitOil', body.capacitOil);
    appendFormDataValue(formData, 'Image', body.image);
    appendFormDataValue(formData, 'url', imagePayload?.attachment);
    appendFormDataValue(formData, 'Url', imagePayload?.attachment);
    appendFormDataValue(formData, 'imageExtension', imagePayload?.extension);
    appendFormDataValue(formData, 'ImageExtension', imagePayload?.extension);
    appendFormDataValue(formData, 'attachment', imagePayload?.attachment);
    appendFormDataValue(formData, 'Attachment', imagePayload?.attachment);
    appendFormDataValue(formData, 'extension', imagePayload?.extension);
    appendFormDataValue(formData, 'Extension', imagePayload?.extension);
    return formData;
  }

  private getByIdFromList(
    id: string,
    fleetId?: string,
    sourceError?: unknown,
  ): Observable<Vehicle> {
    return this.api
      .getData<unknown[]>(
        `${this.base}/List`,
        {
          ...buildFleetQueryParams(fleetId, 'both'),
        },
        { suppressErrorToast: true },
      )
      .pipe(
        map(items => (items ?? []).map(normalizeVehicle)),
        map(items => items.find(item => String(item.id) === String(id))),
        map(item => {
          if (!item) {
            throw sourceError ?? new Error('Vehicle not found');
          }
          return item;
        }),
        catchError(error => throwError(() => sourceError ?? error)),
      );
  }
}



