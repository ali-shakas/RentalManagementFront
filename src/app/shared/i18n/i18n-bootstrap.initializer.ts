import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { LayoutService } from '../services/layout/layout.service';

/** Must match `Language` header component (`app_language`, supported codes). */
const APP_LANGUAGE_KEY = 'app_language';

/**
 * Applies saved language, loads ngx-translate bundles, and sets document direction
 * before any route (including login). Without this, RTL and `instant()` only run
 * after the header mounts post-login.
 */
export function bootstrapI18nFromStorage(): Promise<void> {
  const translate = inject(TranslateService);
  const layout = inject(LayoutService);

  translate.setDefaultLang('en');
  const saved = localStorage.getItem(APP_LANGUAGE_KEY)?.toLowerCase();
  const lang = saved === 'ar' ? 'ar' : 'en';
  const direction = lang === 'ar' ? 'rtl' : 'ltr';

  return firstValueFrom(translate.use(lang)).then(() => {
    layout.applyDirection(direction, lang);
  });
}
