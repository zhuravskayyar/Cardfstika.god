import { createRegisteredAccount, normalizeAccount, validateAccountName } from './account.js';

const MIN_PASSWORD_LENGTH = 4;

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password) {
  const value = String(password ?? '');
  if (!globalThis.crypto?.subtle) {
    throw new Error('cryptoUnavailable');
  }
  const data = new TextEncoder().encode(value);
  return toHex(await crypto.subtle.digest('SHA-256', data));
}

function validatePassword(password) {
  const value = String(password ?? '');
  if (value.length < MIN_PASSWORD_LENGTH) return { ok: false, error: 'passwordTooShort' };
  return { ok: true, password: value };
}

export async function registerLocal({ username, password, passwordRepeat }) {
  const nameValidation = validateAccountName(username);
  if (!nameValidation.ok) {
    return { ok: false, error: 'invalidName', details: nameValidation.errors };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.ok) return passwordValidation;

  if (String(password) !== String(passwordRepeat)) {
    return { ok: false, error: 'passwordMismatch' };
  }

  const passwordHash = await hashPassword(password);
  return {
    ok: true,
    account: createRegisteredAccount({
      username: nameValidation.name,
      passwordHash,
    }),
  };
}

export async function loginLocal(accountLike, { username, password }) {
  const account = normalizeAccount(accountLike);
  const nameValidation = validateAccountName(username);
  if (!nameValidation.ok) return { ok: false, error: 'invalidName' };
  if (!account.credentials?.username || !account.credentials?.passwordHash) {
    return { ok: false, error: 'accountMissing' };
  }
  if (account.credentials.username !== nameValidation.name) {
    return { ok: false, error: 'invalidCredentials' };
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== account.credentials.passwordHash) {
    return { ok: false, error: 'invalidCredentials' };
  }

  return {
    ok: true,
    account: normalizeAccount({
      ...account,
      isAuthenticated: true,
    }),
  };
}

export function logoutLocal(accountLike) {
  const account = normalizeAccount(accountLike);
  return normalizeAccount({
    ...account,
    isAuthenticated: false,
  });
}
