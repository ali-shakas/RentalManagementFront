import { Injectable, inject } from '@angular/core';

import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';

import { PaginatedAggregatorResponse } from '../../../../core/interfaces';
import { BaseRequestOptions, BaseService } from '../../../../shared/services/base/base.service';
import {
  buildFleetQueryParams,
  normalizeFleetId,
} from '../../../../shared/utils/fleet-query.utils';
import { buildImageUploadPayload } from '../../../../shared/utils/image-upload.utils';
import { normalizePaginatedResponse } from '../../../../shared/utils/paginated-response.normalizer';
import { Vehicle, VehicleFilters, VehicleUpsertRequest } from '../../models';
import { normalizeVehicle } from '../../models/vehicles/vehicle.normalizer';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private api = inject(BaseService);
  private readonly base = 'Vehicle';

  getList(params: { fleetId?: string | null; branchId?: number | null; status?: Vehicle['status'] | '' } = {}): Observable<Vehicle[]> {
    const normalizedFleetId = normalizeFleetId(params.fleetId);
    const branchId = params.branchId ?? undefined;
    const status = params.status || undefined;
    const backendStatus = status ? this.toBackendVehicleStatusEnumName(status) : undefined;

    return this.api
      .getData<unknown[]>(
        `${this.base}/List`,
        {
          // Match repository parameter names literally: fleetid, branchId, Stutus.
          fleetid: normalizedFleetId,
          Fleetid: normalizedFleetId,
          branchId,
          BranchId: branchId,
          Stutus: backendStatus,
        },
        { suppressErrorToast: true },
      )
      .pipe(map(items => (items ?? []).map(normalizeVehicle)));
  }

  getPaginated(
    params: VehicleFilters,
    options?: BaseRequestOptions,
  ): Observable<PaginatedAggregatorResponse<Vehicle>> {
    return this.api
      .getData<unknown>(
        `${this.base}/Paginated`,
        {
          // Match repository parameter names literally:
          // fleetid, branchId, categoryVehiclesId, search, orderingEnum, Stutus, orderByDirection, PageNumber, PageSize
          fleetid: normalizeFleetId(params.fleetId),
          Fleetid: normalizeFleetId(params.fleetId),
          branchId: params.branchId ?? undefined,
          BranchId: params.branchId ?? undefined,
          categoryVehiclesId: params.categoryId ?? undefined,
          search: params.search,
          Search: params.search,
          orderingEnum: this.toBackendVehicleOrderingEnum(params.orderBy),
          OrderingEnum: this.toBackendVehicleOrderingEnum(params.orderBy),
          Stutus: params.status ? this.toBackendVehicleStatusEnumName(params.status) : undefined,
          orderByDirection: this.toBackendOrderDirection(params.orderByDirection),
          OrderByDirection: this.toBackendOrderDirection(params.orderByDirection),
          pageNumber: params.pageNumber,
          PageNumber: params.pageNumber,
          pageSize: params.pageSize,
          PageSize: params.pageSize,
        },
        options,
      )
      .pipe(map(response => normalizePaginatedResponse(response, normalizeVehicle)));
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
    return from(this.toApiPayload(body)).pipe(
      switchMap(payload => this.api.postData(this.base, payload)),
    );
  }

  update(body: VehicleUpsertRequest): Observable<unknown> {
    return from(this.toApiPayload(body)).pipe(
      switchMap(payload => this.api.putData(`${this.base}/${body.id}`, payload)),
    );
  }

  changeStatus(id: string | number, status: VehicleUpsertRequest['status']): Observable<boolean> {
    const vehicleId = Number(id);
    const vehicleEnumCode = this.toBackendVehicleStatusEnumCode(status);
    const vehicleEnumName = this.toBackendVehicleStatusEnumName(status);
    const endpoint = `${this.base}/Status/${vehicleId}`;

    // Match backend command shape exactly: { id, vehicleEnum }.
    // Try numeric enum first (default ASP.NET behavior), then string enum name as fallback.
    return this.api.putData<boolean>(endpoint, {
      id: vehicleId,
      vehicleEnum: vehicleEnumCode,
    }).pipe(
      catchError(() =>
        this.api.putData<boolean>(endpoint, {
          id: vehicleId,
          vehicleEnum: vehicleEnumName,
        }),
      ),
    );
  }

  softDelete(id: string | number): Observable<boolean> {
    return this.api.patchData<boolean>(`${this.base}/SoftDelete/${id}`, {});
  }

  private async toApiPayload(body: VehicleUpsertRequest): Promise<Record<string, unknown>> {
    const imagePayload = await buildImageUploadPayload(body.image);
    const isAvailable = body.status === 'Available';
    const statusCode =
      body.status === 'Available'
        ? 1
        : body.status === 'Booked'
          ? 2
          : body.status === 'Maintenance'
            ? 3
            : 4;

    return {
      id: body.id,
      color: body.color,
      insuranceNumber: body.insuranceNumber,
      insuranceType: body.insuranceType,
      insuranceExpires: body.insuranceExpires,
      licenseExpirationDate: body.licenseExpirationDate,
      insurancePolicyNumber: body.insurancePolicyNumber,
      operatinCard: body.operatinCard,
      validityCarRegistration: body.validityCarRegistration,
      fleetId: body.fleetId,
      branchId: body.branchId,
      idCategoryVehicle: body.idCategoryVehicle,
      vin: body.vin,
      yearMake: body.yearMake,
      engine: body.engine,
      serialNumber: body.serialNumber,
      plateNumber: body.plateNumber,
      countKm: body.countKm,
      capacitOil: body.capacitOil,
      status: body.status,
      Status: body.status,
      vehicleStatus: body.status,
      VehicleStatus: body.status,
      stutus: body.status,
      Stutus: body.status,
      statusCode,
      StatusCode: statusCode,
      isAvailable,
      IsAvailable: isAvailable,
      isAvalible: isAvailable,
      IsAvalible: isAvailable,
      isActive: body.isActive,
      notes: body.notes,
      url: imagePayload?.attachment,
      Url: imagePayload?.attachment,
      imageExtension: imagePayload?.extension,
      ImageExtension: imagePayload?.extension,
      attachment: imagePayload?.attachment,
      Attachment: imagePayload?.attachment,
      extension: imagePayload?.extension,
      Extension: imagePayload?.extension,
    };
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

  private toBackendVehicleStatusEnumCode(status: VehicleUpsertRequest['status']): number {
    if (status === 'Booked') {
      return 1; // IsBooking
    }

    if (status === 'Maintenance') {
      return 3; // IsMaintanes
    }

    if (status === 'Inactive') {
      return 4; // IsMangament
    }

    return 2; // IsAvalible
  }

  private toBackendVehicleStatusEnumName(status: VehicleUpsertRequest['status']): string {
    if (status === 'Booked') {
      return 'IsBooking';
    }

    if (status === 'Maintenance') {
      return 'IsMaintanes';
    }

    if (status === 'Inactive') {
      return 'IsMangament';
    }

    return 'IsAvalible';
  }

  private toBackendVehicleOrderingEnum(orderBy?: VehicleFilters['orderBy']): string | undefined {
    if (!orderBy) {
      return undefined;
    }

    if (orderBy === 'Year') {
      return 'Year';
    }

    if (orderBy === 'Plantnumber') {
      return 'Plantnumber';
    }

    return undefined;
  }

  private toBackendOrderDirection(direction?: VehicleFilters['orderByDirection']): 'Ascending' | 'Descending' {
    return direction === 'ASC' ? 'Ascending' : 'Descending';
  }
}
