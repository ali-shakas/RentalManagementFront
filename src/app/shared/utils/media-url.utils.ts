import { environment } from '../../../environments/environment';

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const origin = environment.apiBaseUrl.split('/Api/')[0];
  if (path.startsWith('/')) {
    return `${origin}${path}`;
  }

  return `${origin}/${path}`;
}
