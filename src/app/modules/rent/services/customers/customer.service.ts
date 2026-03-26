import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { Customer, CustomerFilters, CustomerUpsertRequest, PaginatedResponse } from '../../models';
import { normalizeCustomer, normalizePaginatedResponse } from '../../../../shared/utils/api-normalizers';
import { appendFormDataValue } from '../../../../shared/utils/form-data.utils';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private api = inject(BaseService);
  private readonly base = 'Customer';

  getPaginated(params: CustomerFilters): Observable<PaginatedResponse<Customer>> {
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
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
    }).pipe(map(response => normalizePaginatedResponse(response, normalizeCustomer)));
  }

  getById(id: string, fleetId: string): Observable<Customer> {
    return this.api.getData<unknown>(`${this.base}/${id}/${fleetId}`).pipe(map(normalizeCustomer));
  }

  create(body: CustomerUpsertRequest): Observable<unknown> {
    return this.api.postData(this.base, this.toFormData(body));
  }

  update(body: CustomerUpsertRequest): Observable<unknown> {
    return this.api.putData(`${this.base}/${body.id}`, this.toFormData(body));
  }

  private toFormData(body: CustomerUpsertRequest): FormData {
    const formData = new FormData();
    appendFormDataValue(formData, 'NameAr', body.nameAr);
    appendFormDataValue(formData, 'NameEn', body.nameEn);
    appendFormDataValue(formData, 'FirstMobileNumber', body.firstMobileNumber);
    appendFormDataValue(formData, 'SecondMobileNumber', body.secondMobileNumber);
    appendFormDataValue(formData, 'ThirdMobileNumber', body.thirdMobileNumber);
    appendFormDataValue(formData, 'Address', body.address);
    appendFormDataValue(formData, 'LicenceNo', body.licenceNo);
    appendFormDataValue(formData, 'IdNationality', body.idNationality);
    appendFormDataValue(formData, 'DateIdNationality', body.dateIdNationality);
    appendFormDataValue(formData, 'BirthDay', body.birthDay);
    appendFormDataValue(formData, 'PlaseIdNationality', body.plaseIdNationality);
    appendFormDataValue(formData, 'PlaseDrivinglicense', body.plaseDrivinglicense);
    appendFormDataValue(formData, 'Nationality', body.nationality);
    appendFormDataValue(formData, 'DateDrivinglicense', body.dateDrivinglicense);
    appendFormDataValue(formData, 'DateDrivinglicenseHajri', body.dateDrivinglicenseHajri);
    appendFormDataValue(formData, 'TaxRecord', body.taxRecord);
    appendFormDataValue(formData, 'Email', body.email);
    appendFormDataValue(formData, 'IdSubscriptionsOfCustomer', body.idSubscriptionsOfCustomer);
    appendFormDataValue(formData, 'FleetId', body.fleetId);
    appendFormDataValue(formData, 'Image', body.image);
    return formData;
  }
}



