import { Component } from '@angular/core';

import { Feathericon } from '../../feathericon/feathericon';

@Component({
  selector: 'app-message',
  templateUrl: './message.html',
  styleUrls: ['./message.scss'],
  imports: [Feathericon],
})
export class Message {
  public MassageData: boolean = false;

  Message() {
    this.MassageData = !this.MassageData;
  }
}
