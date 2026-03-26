import { NgClass } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavMenuService } from '../../services/layout/nav-menu.service';
import { HorizontalHeader } from './horizontal-header/horizontal-header';
import { Language } from './language/language';
import { Notification } from './notification/notification';
import { Profile } from './profile/profile';
import { Theme } from './theme/theme';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  imports: [
    NgClass,
    RouterLink,
    HorizontalHeader,
    Notification,
    Theme,
    Language,
    Profile,
  ],
})
export class Header {
  public navmenu = inject(NavMenuService);

  openMenu() {
    this.navmenu.isDisplay = !this.navmenu.isDisplay;
  }

  @HostListener('window:resize')
  onResize() {
    this.navmenu.isDisplay = window.innerWidth < 1200;
  }

  languageToggle() {
    this.navmenu.language = !this.navmenu.language;
  }
}
