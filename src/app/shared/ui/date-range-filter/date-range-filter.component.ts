import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface DateRangeValue {
  from: string;
  to: string;
}

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.scss',
})
export class DateRangeFilterComponent {
  @Input() from = '';
  @Input() to = '';
  @Input() fromLabel = 'From';
  @Input() toLabel = 'To';
  @Input() fromPlaceholder = 'Date from';
  @Input() toPlaceholder = 'Date to';
  @Input() disabled = false;

  @Output() rangeChange = new EventEmitter<DateRangeValue>();

  onFromChange(value: string): void {
    this.rangeChange.emit({
      from: value ?? '',
      to: this.to ?? '',
    });
  }

  onToChange(value: string): void {
    this.rangeChange.emit({
      from: this.from ?? '',
      to: value ?? '',
    });
  }
}
