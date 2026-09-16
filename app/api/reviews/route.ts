import { identity, storage, json, failure, body } from '@/lib/storage';
import { reviewSchema } from '@/lib/validation';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function POST(req: Request) { try { const user = await identity(req); return json({ card: await storage().review(user, reviewSchema.parse(await body(req))) }); } catch (e) { return failure(e); } }
