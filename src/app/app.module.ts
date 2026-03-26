import { NgModule } from '@angular/core';
import { provideAppInitializer, inject } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AuthStateService } from './core/auth/auth-state.service';
import { AppRoutingModule } from './app.routes';
import { AuthenticationModule } from './auth/authentication.module';
import { jwtInterceptor } from './shared/http-interceptors/jwt.interceptor';
import { httpErrorInterceptor } from './shared/http-interceptors/http-error.interceptor';
import { MultiTranslateLoader } from './shared/i18n/multi-translate.loader';
import { SharedModule } from './shared/shared.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateLoader(http);
}

@NgModule({
  imports: [
    AppRoutingModule,
    SharedModule,
    AuthenticationModule,
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    provideAppInitializer(() => {
      inject(AuthStateService).restoreSession();
    }),
    provideHttpClient(withInterceptors([jwtInterceptor, httpErrorInterceptor])),
    provideAnimations(),
  ],
})
export class AppModule {}
