export function parseRouteJson<T>(value?: string | string[]): T | undefined {
  if (!value || Array.isArray(value)) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function getRouteParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

/** Encode values (e.g. image URLs) before passing through Expo Router params. */
export function encodeRouteParam(value: string): string {
  return encodeURIComponent(value);
}

/** Decode a param that was passed with encodeRouteParam. */
export function decodeRouteParam(value?: string | string[]): string {
  const raw = getRouteParam(value);
  if (!raw) {
    return '';
  }

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function decodeRouteJson<T>(value?: string | string[]): T | undefined {
  const decoded = decodeRouteParam(value);
  if (!decoded) {
    return undefined;
  }

  try {
    return JSON.parse(decoded) as T;
  } catch {
    return undefined;
  }
}

/**
 * Firebase Storage download URLs must encode `/` in the object path as `%2F`.
 * Firestore often stores the human-readable form with literal slashes.
 */
export function normalizeFirebaseStorageUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return undefined;
  }

  const match = trimmed.match(
    /^(https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/)(.+?)(\?alt=media.*)$/i,
  );

  if (!match) {
    return trimmed;
  }

  const [, prefix, objectPath, query] = match;

  let decodedPath = objectPath;
  try {
    decodedPath = decodeURIComponent(objectPath);
  } catch {
    decodedPath = objectPath;
  }

  return `${prefix}${encodeURIComponent(decodedPath)}${query}`;
}

export function parseRouteFlag(value?: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value[0] === '1';
  }

  return value === '1';
}
