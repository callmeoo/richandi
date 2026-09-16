import 'server-only';
import { createNeonAuth } from '@neondatabase/auth/next/server';
import { redirect } from 'next/navigation';
import { isOwner } from './policy';
let instance: ReturnType<typeof createNeonAuth> | undefined;
export function authReady() { return !!(process.env.NEON_AUTH_BASE_URL && (process.env.NEON_AUTH_COOKIE_SECRET?.length ?? 0) >= 32 && process.env.OWNER_EMAIL); }
export function auth() {
  if (!authReady()) throw new Error('Authentication configuration is missing');
  return instance ??= createNeonAuth({ baseUrl: process.env.NEON_AUTH_BASE_URL!, cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!, sameSite: 'lax' } });
}
export async function getUser() {
  const { data: session } = await auth().getSession();
  if (!session?.user || !isOwner(session.user, process.env.OWNER_EMAIL)) return null;
  // A verified email keeps the same library when moving from Sites or recreating an auth account.
  return { userId: session.user.email.trim().toLowerCase(), displayName: session.user.name || session.user.email };
}
export async function requireUser() {
  if (!authReady()) redirect('/auth/sign-in');
  const user = await getUser();
  if (!user) redirect('/auth/sign-in');
  return user;
}
