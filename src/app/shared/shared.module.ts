import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Loader } from './component/loader/loader';
import { TapToTop } from './component/tap-to-top/tap-to-top';
import { ToastContainerComponent } from './component/toast-container/toast-container.component';
import { Breadcrumb } from './component/breadcrumb/breadcrumb';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { Sidebar } from './component/sidebar/sidebar';
import { Content } from './component/layout/content/content';
import { ClickOutsideDirective } from './directives/outside.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClickOutsideDirective,
    Loader,
    TapToTop,
    ToastContainerComponent,
    Breadcrumb,
    Header,
    Footer,
    Sidebar,
    Content,
  ],
  exports: [
    CommonModule,
    RouterModule,
    Loader,
    TapToTop,
    ToastContainerComponent,
    Breadcrumb,
    Header,
    Footer,
    Sidebar,
    Content,
    ClickOutsideDirective,
  ],
})
export class SharedModule {}
