import { ApiError } from '../errors';
export function isOwner(user: { email?: string; emailVerified?: boolean }, ownerEmail: string | undefined) {
  return !!ownerEmail && user.emailVerified === true && user.email?.trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}
export function assertSameOrigin(request: Request) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  if (request.headers.get('origin') !== new URL(request.url).origin) throw new ApiError(403, '请在应用内提交');
}
