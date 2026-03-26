import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.html',
  styleUrls: ['./app-list.scss'],
  imports: [RouterLink],
})
export class AppList {
  public open: boolean = false;

  openmenu() {
    this.open == !this.open;
  }
}
