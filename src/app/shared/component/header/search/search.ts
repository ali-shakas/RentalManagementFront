import { SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClickOutsideDirective } from '../../../directives/outside.directive';
import { NavMenuService, Menu } from '../../../services/layout/nav-menu.service';
import { SvgIcon } from '../../svg-icon/svg-icon';

@Component({
  selector: 'app-search',
  templateUrl: './search.html',
  styleUrls: ['./search.scss'],
  imports: [FormsModule, ClickOutsideDirective, SvgIcon, RouterLink, SlicePipe],
})
export class Search {
  public navServices = inject(NavMenuService);

  public menuItems: Menu[] = [];
  public item: Menu[] = [];
  public searchResult: boolean = false;
  public searchResultEmpty: boolean = false;
  public text: string = '';
  public open = false;

  constructor() {
    this.navServices.item.subscribe((menuItems: Menu[]) => (this.item = menuItems));
  }

  openMenu() {
    this.open = !this.open;
  }

  searchTerm(term: string) {
    term ? this.addFix() : this.removeFix();
    if (!term) return (this.menuItems = []);
    let items: Menu[] = [];
    term = term.toLowerCase();
    this.item?.filter(menuItems => {
      if (menuItems.title?.toLowerCase().includes(term) && menuItems.type === 'link') {
        items.push(menuItems);
      }
      menuItems.children?.filter(subItems => {
        if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
          subItems.icon = menuItems.icon;
          items.push(subItems);
        }
        subItems.children?.filter(suSubItems => {
          if (suSubItems.title?.toLowerCase().includes(term)) {
            suSubItems.icon = menuItems.icon;
            items.push(suSubItems);
          }
        });
        return;
      });
      this.checkSearchResultEmpty(items);
      this.menuItems = items;
    });
    return;
  }

  checkSearchResultEmpty(items: Menu[]) {
    if (!items.length) this.searchResultEmpty = true;
    else this.searchResultEmpty = false;
  }

  addFix() {
    this.searchResult = true;
    document.body.classList.add('offcanvas');
  }

  removeFix() {
    this.searchResult = false;
    this.text = '';
    document.body.classList.remove('offcanvas');
  }

  clickOutside(): void {
    this.searchResult = false;
    this.searchResultEmpty = false;
    document.body.classList.remove('offcanvas');
  }
}
