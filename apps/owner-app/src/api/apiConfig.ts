const DEFAULT_API_BASE_URL = 'https://foodhub.tmc-innovations.com/api';

const normalizeBaseUrl = (value?: string | null) => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }

  return trimmed.replace(/\/+$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
export const API_PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/i, '');

export const buildApiUrl = (endpoint: string) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

const stripManagedMediaPrefix = (path: string) => {
  let normalizedPath = path.replace(/\\/g, '/').trim();

  if (!normalizedPath) {
    return '';
  }

  try {
    const parsedUrl = new URL(normalizedPath);
    normalizedPath = parsedUrl.pathname;
  } catch {
    // Keep relative paths as-is.
  }

  normalizedPath = normalizedPath.replace(/^\/+/, '');

  if (normalizedPath.startsWith('api/media/')) {
    normalizedPath = normalizedPath.slice('api/media/'.length);
  }

  if (normalizedPath.startsWith('storage/')) {
    normalizedPath = normalizedPath.slice('storage/'.length);
  }

  return normalizedPath.replace(/^\/+/, '');
};

const encodeManagedMediaPath = (path: string) =>
  stripManagedMediaPrefix(path)
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const isManagedMediaPath = (path: string) => {
  const normalizedPath = stripManagedMediaPrefix(path).toLowerCase();

  return (
    normalizedPath.startsWith('restaurants/') ||
    normalizedPath.startsWith('menu_items/') ||
    normalizedPath.startsWith('reviews/') ||
    normalizedPath.startsWith('orders/receipts/')
  );
};

const resolveManagedMediaUrl = (path: string) => {
  const encodedPath = encodeManagedMediaPath(path);
  return encodedPath ? `${API_PUBLIC_BASE_URL}/api/media/${encodedPath}` : '';
};

export const resolveApiMediaUrl = (path?: string | null) => {
  if (!path || typeof path !== 'string') {
    return null;
  }

  const normalizedPath = path.replace(/\\/g, '/').trim();

  if (!normalizedPath) {
    return null;
  }

  if (normalizedPath.startsWith('blob:') || normalizedPath.startsWith('data:')) {
    return normalizedPath;
  }

  if (
    normalizedPath.includes('/api/media/') ||
    normalizedPath.includes('/storage/') ||
    isManagedMediaPath(normalizedPath)
  ) {
    return resolveManagedMediaUrl(normalizedPath);
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    try {
      const parsedUrl = new URL(normalizedPath);
      const isLocalhost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

      if (isLocalhost) {
        return `${API_PUBLIC_BASE_URL}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
    } catch {
      return normalizedPath;
    }

    return normalizedPath;
  }

  if (normalizedPath.startsWith('//')) {
    return `https:${normalizedPath}`;
  }

  if (normalizedPath.startsWith('/')) {
    return `${API_PUBLIC_BASE_URL}${normalizedPath}`;
  }

  return `${API_PUBLIC_BASE_URL}/${normalizedPath}`;
};
