import { Component, inject, input } from '@angular/core';

import { LayoutService } from '../../services/layout/layout.service';

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.html',
  styleUrls: ['./svg-icon.scss'],
  imports: [],
})
export class SvgIcon {
  public layoutService = inject(LayoutService);

  public readonly icon = input<string>();

  getSvgType() {
    return document.getElementsByClassName('sidebar-wrapper')[0].getAttribute('icon') == 'fill-svg';
  }
}
