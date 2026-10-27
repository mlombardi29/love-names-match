import assert from 'node:assert/strict';
import { friendlyError } from '../src/lib/authErrors.ts';
import {
  isPasswordRecoveryCallback,
  PASSWORD_RESET_REDIRECT,
  readAuthCallbackParams,
} from '../src/lib/passwordReset.ts';

assert.equal(
  PASSWORD_RESET_REDIRECT,
  'https://love-names-match.vercel.app/reset-password',
);

const implicit = readAuthCallbackParams(
  'https://love-names-match.vercel.app/reset-password#access_token=abc&refresh_token=def&type=recovery&expires_in=3600',
);
assert.equal(implicit.type, 'recovery');
assert.equal(implicit.accessToken, 'abc');
assert.equal(isPasswordRecoveryCallback(implicit), true);

const tokenHash = readAuthCallbackParams(
  'https://love-names-match.vercel.app/reset-password?token_hash=hash&type=recovery',
);
assert.equal(tokenHash.tokenHash, 'hash');
assert.equal(isPasswordRecoveryCallback(tokenHash), true);

const queryWins = readAuthCallbackParams(
  'https://love-names-match.vercel.app/reset-password?type=recovery&token_hash=from-query#type=signup&access_token=from-hash',
);
assert.equal(queryWins.type, 'recovery');
assert.equal(queryWins.accessToken, 'from-hash');
assert.equal(queryWins.tokenHash, 'from-query');

const expired = readAuthCallbackParams(
  'https://love-names-match.vercel.app/reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
);
assert.equal(expired.errorCode, 'otp_expired');
assert.match(expired.errorDescription ?? '', /expired/i);
assert.equal(isPasswordRecoveryCallback(expired), false);

const signIn = readAuthCallbackParams('https://love-names-match.vercel.app/auth');
assert.equal(isPasswordRecoveryCallback(signIn), false);

assert.match(friendlyError('Email rate limit exceeded'), /hourly limit/);
assert.match(friendlyError('Email address "a@b.com" cannot be used as it is not authorized'), /project team/);
assert.match(friendlyError('Email link is invalid or has expired'), /expired or was already used/);
assert.match(friendlyError('Invalid login credentials'), /isn't ringing any bells/);
assert.match(friendlyError('Password should be at least 6 characters'), /at least 6/);
assert.match(friendlyError('New password should be different from the old password.'), /different one/);

console.log('password reset checks passed');
