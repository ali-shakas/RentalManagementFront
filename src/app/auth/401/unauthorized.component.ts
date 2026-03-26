import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="text-center py-5">
      <h1>401</h1>
      <p>Unauthorized. Please log in.</p>
      <a routerLink="/auth/login" class="btn btn-primary">Login</a>
    </div>
  `,
})
export class UnauthorizedComponent {}
