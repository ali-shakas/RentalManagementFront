import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

function mergeDeep(target: any, source: any): any {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;
  for (const key of Object.keys(source)) {
    const tVal = target[key];
    const sVal = source[key];
    if (Array.isArray(sVal)) {
      target[key] = sVal.slice();
    } else if (typeof sVal === 'object' && sVal !== null) {
      target[key] = mergeDeep(typeof tVal === 'object' && tVal !== null ? { ...tVal } : {}, sVal);
    } else {
      target[key] = sVal;
    }
  }
  return target;
}

@Injectable()
export class MultiTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const l = (lang || 'en').toLowerCase();
    const paths = [
      `./assets/i18n/common/${l}.json`,
      `./assets/i18n/modules/dashboard/${l}.json`,
      `./assets/i18n/modules/users/${l}.json`,
      `./assets/i18n/modules/fleet/${l}.json`,
      `./assets/i18n/modules/branches/${l}.json`,
      `./assets/i18n/modules/vehicles/${l}.json`,
      `./assets/i18n/modules/category-vehicles/${l}.json`,
      `./assets/i18n/modules/customers/${l}.json`,
      `./assets/i18n/modules/booking/${l}.json`,
      `./assets/i18n/modules/security/${l}.json`,
    ];

    const requests = paths.map(p =>
      this.http.get<any>(p).pipe(
        // If a module file doesn't exist yet, treat as empty.
        // (This keeps the app working while you add translations gradually.)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map(res => res ?? {}),
        catchError(() => of({})),
      ),
    );

    return forkJoin(requests).pipe(
      map(list => list.reduce((acc, cur) => mergeDeep(acc, cur), {} as any)),
    );
  }
}

