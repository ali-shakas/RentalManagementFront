import { Injectable, signal } from '@angular/core';

/**
 * Full-screen shell loader (boot + post-login transition).
 * Used by {@link Loader} and login success flow.
 */
@Injectable({
  providedIn: 'root',
})
export class AppShellLoadingService {
  private readonly postAuthTransition = signal(false);

  /** True while showing overlay after login until the next navigation completes. */
  readonly transitionActive = this.postAuthTransition.asReadonly();

  /** Call immediately before navigating to the app shell after successful login. */
  enterPostAuthTransition(): void {
    this.postAuthTransition.set(true);
  }

  exitPostAuthTransition(): void {
    this.postAuthTransition.set(false);
  }
}
