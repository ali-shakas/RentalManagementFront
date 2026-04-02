import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent implements OnChanges {
  @Input() label = 'Upload image';
  @Input() accept = 'image/*';
  @Input() previewUrl: string | null = null;
  @Input() fallbackPreviewUrl: string | null = null;
  @Input() maxSizeMb = 2;
  @Input() allowedExtensions: string[] = ['jpg', 'jpeg', 'png', 'webp'];
  @Output() fileSelected = new EventEmitter<File | null>();

  localPreview = signal<string | null>(null);
  previewBroken = signal(false);
  validationMessage = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['previewUrl']) {
      this.previewBroken.set(false);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.validationMessage.set(null);
    this.previewBroken.set(false);

    if (!file) {
      this.fileSelected.emit(null);
      this.localPreview.set(null);
      return;
    }

    if (!this.isAcceptedImage(file)) {
      this.fileSelected.emit(null);
      this.localPreview.set(null);
      input.value = '';
      this.validationMessage.set('Allowed image types: JPG, JPEG, PNG, WEBP.');
      return;
    }

    if (!this.isWithinSizeLimit(file)) {
      this.fileSelected.emit(null);
      this.localPreview.set(null);
      input.value = '';
      this.validationMessage.set(`Image size must be ${this.maxSizeMb}MB or less.`);
      return;
    }

    this.fileSelected.emit(file);

    const reader = new FileReader();
    reader.onload = () =>
      this.localPreview.set(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }

  getPreviewSrc(): string | null {
    return this.localPreview() || this.previewUrl || this.fallbackPreviewUrl;
  }

  onPreviewError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    const fallback = this.fallbackPreviewUrl?.trim() || null;

    if (image && fallback && image.getAttribute('src') !== fallback) {
      image.setAttribute('src', fallback);
      return;
    }

    this.previewBroken.set(true);
  }

  private isWithinSizeLimit(file: File): boolean {
    const maxBytes = Math.max(1, this.maxSizeMb) * 1024 * 1024;
    return file.size <= maxBytes;
  }

  private isAcceptedImage(file: File): boolean {
    const normalizedAllowed = this.allowedExtensions
      .map(ext => ext.trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean);
    if (!normalizedAllowed.length) {
      return true;
    }

    const extension = this.extractExtension(file.name);
    if (extension) {
      return normalizedAllowed.includes(extension);
    }

    const mimeSubtype = file.type?.split('/')[1]?.toLowerCase();
    if (!mimeSubtype) {
      return false;
    }

    return normalizedAllowed.includes(mimeSubtype === 'pjpeg' ? 'jpeg' : mimeSubtype);
  }

  private extractExtension(fileName: string): string | null {
    const rawExtension = fileName.split('.').pop()?.trim().toLowerCase();
    if (!rawExtension) {
      return null;
    }

    if (rawExtension === 'jpg') {
      return 'jpeg';
    }

    return rawExtension;
  }
}
