'use server';

import { cookies, headers } from 'next/headers';
import { randomBytes } from 'crypto';
import { CSRF_COOKIE, CSRF_HEADER } from './constants';

/** Mint the CSRF cookie if missing and return the token */
export async function setCsrfCookie(): Promise<string> {
  const jar = await cookies();
  let token = jar.get(CSRF_COOKIE)?.value;

  if (!token) {
    token = randomBytes(32).toString('hex');
    jar.set(CSRF_COOKIE, token, {
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      // not httpOnly so the client can read it (double-submit pattern)
      httpOnly: false,
      maxAge: 60 * 60 * 24, // 1 day
    });
  }
  return token;
}

/** Verify header token matches cookie token, and origin host matches request host (scheme-agnostic). */
export async function verifyCsrf() {
  const hdrs = await headers();
  const jar  = await cookies();

  // 1) Double-submit token match
  const headerToken = hdrs.get(CSRF_HEADER) ?? '';
  const cookieToken = jar.get(CSRF_COOKIE)?.value ?? '';
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    throw new Error('CSRF token mismatch');
  }

  // 2) Same-origin check using host only (works on localhost without any env var)
  const origin = hdrs.get('origin');     // e.g. http://localhost:3000
  const host   = hdrs.get('host') ?? ''; // e.g. localhost:3000
  if (origin) {
    let originHost = '';
    try {
      originHost = new URL(origin).host; // strips scheme
    } catch {
      throw new Error('Invalid request origin');
    }
    if (originHost !== host) {
      throw new Error('Invalid request origin');
    }
  }
  // If there is no Origin header (some same-site/curl cases), we allow it.
}
