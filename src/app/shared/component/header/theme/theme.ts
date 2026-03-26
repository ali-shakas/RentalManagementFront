import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

import { LayoutService } from '../../../services/layout/layout.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.html',
  styleUrls: ['./theme.scss'],
  imports: [NgClass],
})
export class Theme {
  public layout = inject(LayoutService);

  public dark: boolean = this.layout.config.settings.layout_version == 'dark-only' ? true : false;

  layoutToggle() {
    this.dark = this.layout.toggleTheme() === 'dark-only';
  }
}
