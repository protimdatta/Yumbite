import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

let client = null;

function getClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  if (!client) client = new OAuth2Client(clientId);
  return client;
}

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID);
}

// Verify a Google ID token (from GIS on the frontend) and return the profile.
// Throws with code GOOGLE_NOT_CONFIGURED when the backend has no client ID.
export async function verifyGoogleIdToken(idToken) {
  const oauth = getClient();
  if (!oauth) {
    const err = new Error('Google sign-in is not configured');
    err.code = 'GOOGLE_NOT_CONFIGURED';
    throw err;
  }
  const ticket = await oauth.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email || !payload.email_verified) {
    const err = new Error('Google account email is not verified');
    err.code = 'GOOGLE_UNVERIFIED';
    throw err;
  }
  return {
    sub: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: (payload.name || payload.email.split('@')[0]).trim(),
    picture: payload.picture || '',
  };
}

// Create-or-link logic (pure DB, no network — unit-testable):
// 1. Existing googleId  -> log in to that account.
// 2. Same verified email (local account) -> link googleId, keep password working.
// 3. Otherwise -> create a new Google customer account (no password stored).
export async function findOrCreateGoogleUser({ sub, email, name, picture }) {
  let user = await User.findOne({ googleId: sub });
  if (user) {
    if (!user.isActive) {
      const err = new Error('Account is deactivated');
      err.code = 'ACCOUNT_DEACTIVATED';
      throw err;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }
    return { user, isNew: false };
  }

  // NOTE: +password is selected so linking keeps authProvider accurate
  user = await User.findOne({ email }).select('+password');
  if (user) {
    if (!user.isActive) {
      const err = new Error('Account is deactivated');
      err.code = 'ACCOUNT_DEACTIVATED';
      throw err;
    }
    // Link: same person, verified email — never a duplicate account.
    user.googleId = sub;
    user.authProvider = user.password ? 'both' : 'google';
    if (!user.avatar && picture) user.avatar = picture;
    await user.save({ validateBeforeSave: false });
    return { user, isNew: false };
  }

  user = await User.create({
    name,
    email,
    googleId: sub,
    authProvider: 'google',
    avatar: picture || '',
  });
  return { user, isNew: true };
}
