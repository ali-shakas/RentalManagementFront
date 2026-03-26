import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  @Input() label = 'Upload image';
  @Input() accept = 'image/*';
  @Input() previewUrl: string | null = null;
  @Output() fileSelected = new EventEmitter<File | null>();

  localPreview = signal<string | null>(null);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileSelected.emit(file);

    if (!file) {
      this.localPreview.set(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.localPreview.set(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }
}
