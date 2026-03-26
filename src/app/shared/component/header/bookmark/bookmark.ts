import { SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClickOutsideDirective } from '../../../directives/outside.directive';
import { NavMenuService, Menu } from '../../../services/layout/nav-menu.service';
import { SvgIcon } from '../../svg-icon/svg-icon';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.html',
  styleUrls: ['./bookmark.scss'],
  imports: [ClickOutsideDirective, RouterLink, SvgIcon, FormsModule, SlicePipe],
})
export class Bookmark {
  public navServices = inject(NavMenuService);

  public menuItems: Menu[] = [];
  public item: Menu[] = [];
  public bookmarkItems: Menu[] = [];
  public text: string = '';
  public bookmarkFlip = false;
  public bookmark = false;
  public open = false;
  public searchResult = false;
  public searchResultEmpty = false;

  ngOnInit(): void {
    this.navServices.item.subscribe((menuItems: Menu[]) => {
      this.item = menuItems;
      this.item.forEach(data => {
        if (data.bookmark) {
          this.bookmarkItems.push(data);
        }
        if (!data.children) return false;
        data.children.filter(subItems => {
          if (subItems.bookmark) {
            this.bookmarkItems.push(subItems);
          }
        });
        return;
      });
    });
  }

  ToggleSearch() {
    this.open = !this.open;
    this.removeFix();
  }

  openBookMark() {
    this.bookmark = !this.bookmark;
  }

  flipBookMark() {
    this.bookmarkFlip = !this.bookmarkFlip;
  }

  searchTerm(term: string) {
    term ? this.addFix() : this.removeFix();
    if (!term) return (this.menuItems = []);
    let items: Menu[] = [];
    term = term.toLowerCase();
    this.item.forEach(data => {
      if (data.title?.toLowerCase().includes(term) && data.type === 'link') {
        items.push(data);
      }
      data.children?.filter(subItems => {
        if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
          subItems.icon = data.icon;
          items.push(subItems);
        }
        subItems.children?.filter((suSubItems: Menu) => {
          if (suSubItems.title?.toLowerCase().includes(term)) {
            suSubItems.icon = data.icon;
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

  openBookmarkSearch() {
    this.open = !this.open;
    this.removeFix();
  }

  checkSearchResultEmpty(items: Menu[]) {
    if (!items.length) this.searchResultEmpty = true;
    else this.searchResultEmpty = false;
  }

  addFix() {
    this.searchResult = true;
    var addFix = document.getElementById('#canvas-bookmark');
    addFix?.classList.add('offcanvas-bookmark');
  }

  removeFix() {
    this.searchResult = false;
    this.text = '';
    var removeFix = document.getElementById('#canvas-bookmark');
    removeFix?.classList.add('offcanvas-bookmark');
  }

  addToBookmark(items: Menu) {
    const index = this.bookmarkItems.indexOf(items);
    if (index === -1 && !items.bookmark) {
      items.bookmark = true;
      this.bookmarkItems.push(items);
      this.text = '';
    } else {
      this.bookmarkItems.splice(index, 1);
      items.bookmark = false;
    }
  }

  clickOutside(): void {
    this.searchResult = false;
    this.searchResultEmpty = false;
  }
}
