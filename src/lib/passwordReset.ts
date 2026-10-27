/**
 * Password-reset helpers.
 *
 * The live Baby Tinder app is https://love-names-match.vercel.app
 * (the deployed Vercel site serves this app and its bundle talks to
 * Supabase project qefcednkzvjhnnoeowbf). Reset emails always send people
 * back to that site's reset page so the link matches the live app.
 */

export const LIVE_SITE_ORIGIN = 'https://love-names-match.vercel.app';
export const PASSWORD_RESET_PATH = '/reset-password';
export const PASSWORD_RESET_REDIRECT = `${LIVE_SITE_ORIGIN}${PASSWORD_RESET_PATH}`;

const RECOVERY_FLAG = 'baby-tinder.password-recovery';

export type AuthCallbackParams = {
  type: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenHash: string | null;
  code: string | null;
  error: string | null;
  errorDescription: string | null;
  errorCode: string | null;
};

export function readAuthCallbackParams(href: string): AuthCallbackParams {
  const url = new URL(href);
  const params = new URLSearchParams();
  if (url.hash.startsWith('#')) {
    new URLSearchParams(url.hash.slice(1)).forEach((value, key) => {
      params.set(key, value);
    });
  }
  // Query params win, matching @supabase/auth-js parseParametersFromURL.
  url.searchParams.forEach((value, key) => {
    params.set(key, value);
  });

  return {
    type: params.get('type'),
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    tokenHash: params.get('token_hash'),
    code: params.get('code'),
    error: params.get('error'),
    errorDescription: params.get('error_description'),
    errorCode: params.get('error_code'),
  };
}

export function isPasswordRecoveryCallback(params: AuthCallbackParams): boolean {
  if (params.type !== 'recovery') return false;
  return Boolean(params.accessToken || params.code || params.tokenHash);
}

type RecoveryCapture = {
  errorMessage: string | null;
  tokenHash: string | null;
};

const captured: RecoveryCapture = { errorMessage: null, tokenHash: null };
let captureRan = false;
let otpAttemptStarted = false;
let sawCallback = false;
let otpPending = false;

export function capturePasswordRecoveryFromUrl(): void {
  if (captureRan || typeof window === 'undefined') return;
  captureRan = true;

  let params: AuthCallbackParams;
  try {
    params = readAuthCallbackParams(window.location.href);
  } catch {
    return;
  }

  if (params.error || params.errorDescription || params.errorCode) {
    captured.errorMessage =
      params.errorDescription ||
      'That reset link is invalid or has expired.';
    return;
  }

  if (!isPasswordRecoveryCallback(params)) return;

  // Don't persist the "set a new password" flag until the link actually
  // produces a session. A bad link must not hijack an existing sign-in.
  sawCallback = true;

  // token_hash links are not exchanged by the client automatically.
  // Implicit (#access_token) and PKCE (?code) links are.
  if (params.tokenHash && !params.accessToken && !params.code) {
    captured.tokenHash = params.tokenHash;
    otpPending = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('token_hash');
    url.searchParams.delete('type');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

export function sawPasswordRecoveryCallback(): boolean {
  return sawCallback;
}

export function isRecoveryOtpPending(): boolean {
  return otpPending;
}

export function settleRecoveryOtp(): void {
  otpPending = false;
}

export function peekCapturedRecoveryError(): string | null {
  return captured.errorMessage;
}

export function consumePendingRecoveryOtp(): { token_hash: string; type: 'recovery' } | null {
  if (otpAttemptStarted || !captured.tokenHash) return null;
  otpAttemptStarted = true;
  return { token_hash: captured.tokenHash, type: 'recovery' };
}

export function markPasswordRecovery(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(RECOVERY_FLAG, '1');
}

export function clearPasswordRecovery(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(RECOVERY_FLAG);
}

export function hasPasswordRecoveryFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(RECOVERY_FLAG) === '1';
}

export function clearCapturedRecoveryError(): void {
  captured.errorMessage = null;
}
