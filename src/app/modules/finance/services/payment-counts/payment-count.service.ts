import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import {
  CreatePaymentCountRequest,
  PaymentCount,
  PaymentCountDetailLineRequest,
} from '../../models/payment-counts/payment-count.model';
import { normalizePaymentCount } from '../../models/payment-counts/payment-count.normalizer';

@Injectable({
  providedIn: 'root',
})
export class PaymentCountService {
  private api = inject(BaseService);
  private readonly base = 'Paymentcount';

  getList(fleetId?: string | null, branchId?: string | null): Observable<PaymentCount[]> {
    return this.api.getData<unknown[]>(`${this.base}/List`, {
      ...buildFleetQueryParams(fleetId, 'both'),
      BranchId: branchId ?? undefined,
    }).pipe(
      map(items => (items ?? []).map(normalizePaymentCount)),
    );
  }

  getPaginated(params: {
    fleetId?: string | null;
    pageSize?: number;
    pageNumber?: number;
    search?: string;
    orderByDirection?: string;
    orderBy?: string;
  }): Observable<unknown> {
    const fleetId = params.fleetId?.trim();
    return this.api.getData<unknown>(`${this.base}/Paginated`, {
      FleetId: fleetId || undefined,
      IdFleet: fleetId || undefined,
      PageSize: params.pageSize,
      PageNumber: params.pageNumber,
      Search: params.search,
      OrderByDirection: params.orderByDirection,
      OrderBy: params.orderBy,
    });
  }

  getById(id: string, fleetId: string): Observable<PaymentCount> {
    const encodedId = encodeURIComponent(id);
    const encodedFleetId = encodeURIComponent(fleetId);
    return this.api
      .getData<unknown>(`${this.base}/${encodedId}/${encodedFleetId}`)
      .pipe(map(item => normalizePaymentCount(item)));
  }

  create(payload: CreatePaymentCountRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, this.toCreateApiPayload(payload));
  }

  private toCreateApiPayload(payload: CreatePaymentCountRequest): Record<string, unknown> {
    return {
      idCustomer: payload.idCustomer,
      IdCustomer: payload.idCustomer,
      paid: payload.paid,
      Paid: payload.paid,
      dscription: payload.dscription,
      Dscription: payload.dscription,
      idVehicle: payload.idVehicle,
      IdVehicle: payload.idVehicle,
      idBranch: payload.idBranch,
      IdBranch: payload.idBranch,
      paymentType: payload.paymentType,
      PaymentType: payload.paymentType,
      bondType: payload.bondType,
      BondType: payload.bondType,
      status: payload.status,
      Status: payload.status,
      idCash: payload.idCash,
      IdCash: payload.idCash,
      idBank: payload.idBank,
      IdBank: payload.idBank,
      paidCash: payload.paidCash,
      PaidCash: payload.paidCash,
      paidBank: payload.paidBank,
      PaidBank: payload.paidBank,
      idBooking: payload.idBooking,
      IdBooking: payload.idBooking,
      stutusbooking: payload.stutusbooking,
      Stutusbooking: payload.stutusbooking,
      idFinancialYear: payload.idFinancialYear,
      IdFinancialYear: payload.idFinancialYear,
      fleetId: payload.fleetId,
      FleetId: payload.fleetId,
      details: payload.details?.map((line, index) => this.toCreateDetailPayload(line, index)),
      paymentCountDetails: payload.details?.map((line, index) => this.toCreateDetailPayload(line, index)),
      PaymentCountDetails: payload.details?.map((line, index) => this.toCreateDetailPayload(line, index)),
    };
  }

  private toCreateDetailPayload(
    line: PaymentCountDetailLineRequest,
    index: number,
  ): Record<string, unknown> {
    const idCounting = String(line.idCounting ?? '').trim();
    const price = Number(line.price ?? 0);
    return {
      idCounting,
      IdCounting: idCounting,
      countingId: idCounting,
      CountingId: idCounting,
      price,
      Price: price,
      node: line.node,
      Node: line.node,
      idBranch: line.idBranch,
      IdBranch: line.idBranch,
      idFinancialYear: line.idFinancialYear,
      IdFinancialYear: line.idFinancialYear,
      lineOrder: index + 1,
      LineOrder: index + 1,
    };
  }
}

