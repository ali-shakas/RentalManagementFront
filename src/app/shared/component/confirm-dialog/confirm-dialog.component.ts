import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';

  private activeModal = inject(NgbActiveModal);
  private resultSubject = new Subject<boolean>();

  result = this.resultSubject.asObservable();

  confirm(): void {
    this.resultSubject.next(true);
    this.resultSubject.complete();
    this.activeModal.close();
  }

  cancel(): void {
    this.resultSubject.next(false);
    this.resultSubject.complete();
    this.activeModal.dismiss();
  }
}
