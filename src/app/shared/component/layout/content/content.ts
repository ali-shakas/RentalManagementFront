import { NgClass } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { LayoutService } from '../../../services/layout/layout.service';
import { NavMenuService } from '../../../services/layout/nav-menu.service';
import { Breadcrumb } from '../../breadcrumb/breadcrumb';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { Sidebar } from '../../sidebar/sidebar';

@Component({
  selector: 'app-content',
  templateUrl: './content.html',
  styleUrls: ['./content.scss'],
  imports: [Header, Sidebar, Breadcrumb, RouterOutlet, Footer, NgClass],
})
export class Content {
  public navmenu = inject(NavMenuService);
  public layout = inject(LayoutService);
  private router = inject(Router);

  public innerWidth: number;

  @HostListener('window:resize')
  onResize() {
    const isMobile = window.innerWidth < 992;
    this.navmenu.isDisplay = isMobile;

    if (isMobile) {
      this.layout.config.settings.sidebar_type = 'compact-wrapper';
    }
  }

  ngOnInit(): void {
    this.router.url;
    this.innerWidth = window.innerWidth;
    this.onResize();
  }
}
