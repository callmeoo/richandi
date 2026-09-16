import { getUser } from './auth/server';
import { assertSameOrigin } from './auth/policy';
import { db } from '../db';
import { repository } from './repository';
import { ApiError } from './errors';
export { ApiError } from './errors';
export async function identity(request?: Request) {
  if (request) assertSameOrigin(request);
  const user = await getUser();
  if (!user) throw new ApiError(401, '登录已过期，请重新登录');
  return user.userId;
}
export function storage() { return repository(db()); }
export function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie', 'X-Content-Type-Options': 'nosniff' } }); }
export function failure(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof Error && error.name === 'ZodError') return json({ error: '内容格式不正确，请检查必填项、长度和链接' }, 400);
  if (error instanceof SyntaxError) return json({ error: '提交内容无效' }, 400);
  console.error('Knowledge API unavailable', { type: error instanceof Error ? error.name : 'unknown' });
  return json({ error: '暂时保存失败，内容已保留，请重试' }, 503);
}
export async function body(request: Request) { const raw = await request.text(); if (raw.length > 70_000) throw new ApiError(413, '内容过长，请分成多张知识卡'); return JSON.parse(raw); }
