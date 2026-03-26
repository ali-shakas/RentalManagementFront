import { Component } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart {
  public products: boolean = false;

  cart() {
    this.products = !this.products;
  }
}
