const OWNER_LOGIN_URL = 'https://foodhub.tmc-innovations.com/api/owner/login';

type ErrorCode = 'NETWORK' | 'SERVER' | 'INVALID_RESPONSE';

type RecordValue = Record<string, unknown>;

export type OwnerUser = {
  id?: number | string;
  name?: string;
  email?: string;
  [key: string]: unknown;
};

export type OwnerLoginPayload = {
  email: string;
  password: string;
};

export type OwnerLoginResult = {
  token: string;
  user: OwnerUser | null;
  raw: unknown;
};

export class AuthServiceError extends Error {
  status?: number;
  code: ErrorCode;

  constructor(message: string, options: { status?: number; code: ErrorCode }) {
    super(message);
    this.name = 'AuthServiceError';
    this.status = options.status;
    this.code = options.code;
  }
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractMessage(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    return toTrimmedString(payload);
  }

  if (!isRecord(payload)) {
    return null;
  }

  const directMessage =
    toTrimmedString(payload.message) ??
    toTrimmedString(payload.error) ??
    toTrimmedString(payload.detail);

  if (directMessage) {
    return directMessage;
  }

  if (!isRecord(payload.errors)) {
    return null;
  }

  const firstErrorValue = Object.values(payload.errors)[0];

  if (Array.isArray(firstErrorValue)) {
    const firstString = firstErrorValue.find((value) => typeof value === 'string');
    return toTrimmedString(firstString);
  }

  return toTrimmedString(firstErrorValue);
}

function extractToken(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const keys = ['token', 'access_token', 'accessToken', 'auth_token'];

  for (const key of keys) {
    const directValue = toTrimmedString(payload[key]);
    if (directValue) {
      return directValue;
    }
  }

  if (!isRecord(payload.data)) {
    return null;
  }

  for (const key of keys) {
    const nestedValue = toTrimmedString(payload.data[key]);
    if (nestedValue) {
      return nestedValue;
    }
  }

  return null;
}

function extractUser(payload: unknown): OwnerUser | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (isRecord(payload.user)) {
    return payload.user as OwnerUser;
  }

  if (isRecord(payload.owner)) {
    return payload.owner as OwnerUser;
  }

  if (!isRecord(payload.data)) {
    return null;
  }

  if (isRecord(payload.data.user)) {
    return payload.data.user as OwnerUser;
  }

  if (isRecord(payload.data.owner)) {
    return payload.data.owner as OwnerUser;
  }

  return null;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as unknown;
    } catch {
      return null;
    }
  }

  const rawText = await response.text();

  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return rawText;
  }
}

export async function loginOwner(payload: OwnerLoginPayload): Promise<OwnerLoginResult> {
  let response: Response;

  try {
    response = await fetch(OWNER_LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthServiceError(
      'Unable to connect. Check your internet connection and try again.',
      { code: 'NETWORK' },
    );
  }

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const serverMessage = extractMessage(body);
    const fallbackMessage =
      response.status === 401 || response.status === 422
        ? 'Invalid credentials. Please verify your email and password.'
        : 'Server error. Please try again in a moment.';

    throw new AuthServiceError(serverMessage ?? fallbackMessage, {
      status: response.status,
      code: 'SERVER',
    });
  }

  const token = extractToken(body);

  if (!token) {
    throw new AuthServiceError(
      'Login succeeded but no token was returned by the server.',
      { status: response.status, code: 'INVALID_RESPONSE' },
    );
  }

  return {
    token,
    user: extractUser(body),
    raw: body,
  };
}
