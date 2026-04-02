export interface ImageUploadPayload {
  attachment: string;
  extension: string;
}

function resolveExtension(file: File): string | null {
  const fromName = file.name?.split('.').pop()?.trim().toLowerCase();
  if (fromName) {
    return fromName;
  }

  const mime = file.type?.split('/').pop()?.trim().toLowerCase();
  if (mime) {
    if (mime === 'jpeg' || mime === 'pjpeg') {
      return 'jpg';
    }

    if (mime === 'svg+xml') {
      return 'svg';
    }

    return mime;
  }

  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function buildImageUploadPayload(
  file?: File | null,
): Promise<ImageUploadPayload | null> {
  if (!file) {
    return null;
  }

  const extension = resolveExtension(file);
  if (!extension) {
    return null;
  }

  const dataUrl = await readFileAsDataUrl(file);
  const attachment = dataUrl.trim();
  if (!attachment) {
    return null;
  }

  return { attachment, extension };
}
