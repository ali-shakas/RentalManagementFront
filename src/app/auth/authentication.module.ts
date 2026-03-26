import { NgModule } from '@angular/core';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './404/not-found.component';
import { UnauthorizedComponent } from './401/unauthorized.component';
import { ServerErrorComponent } from './500/server-error.component';
import { ForbiddenComponent } from './403/forbidden.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyCodeComponent } from './verify-code/verify-code.component';
import { NewPasswordComponent } from './new-password/new-password.component';

@NgModule({
  imports: [
    AuthenticationRoutingModule,
    LoginComponent,
    NotFoundComponent,
    UnauthorizedComponent,
    ServerErrorComponent,
    ForbiddenComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VerifyCodeComponent,
    NewPasswordComponent,
  ],
})
export class AuthenticationModule {}
