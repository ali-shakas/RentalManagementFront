import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BaseService } from '../../../../shared/services/base/base.service';
import { buildFleetQueryParams } from '../../../../shared/utils/fleet-query.utils';
import { CreatePaymentCountRequest, PaymentCount } from '../../models/payment-counts/payment-count.model';
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

  create(payload: CreatePaymentCountRequest): Observable<unknown> {
    return this.api.postData<unknown>(this.base, payload);
  }
}

