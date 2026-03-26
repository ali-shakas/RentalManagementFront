import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { VehicleGroupSummary } from '../../models';
import { BaseService } from '../../../../shared/services/base/base.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = inject(BaseService);

  private readonly base = 'Dashboard';

  getVehicleGroupSummary(): Observable<VehicleGroupSummary[]> {
    return this.api.getData<VehicleGroupSummary[]>(`${this.base}/vehicle-group-summary`).pipe(
      // بعض نسخ الباك إند الحالية لا توفر هذا endpoint بعد، لذا نجعل الـ widget اختيارية بدل كسر الصفحة.
      catchError(() => of([])),
    );
  }
}



