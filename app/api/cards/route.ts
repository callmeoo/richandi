import { identity, storage, json, failure, body } from '@/lib/storage';
import { createSchema, updateSchema, removeSchema } from '@/lib/validation';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET() { try { const user = await identity(); return json({ cards: await storage().list(user), serverTime: Date.now() }); } catch (e) { return failure(e); } }
export async function POST(req: Request) { try { const user = await identity(req); const result = await storage().create(user, createSchema.parse(await body(req))); return json(result, result.reused ? 200 : 201); } catch (e) { return failure(e); } }
export async function PUT(req: Request) { try { const user = await identity(req); return json({ card: await storage().update(user, updateSchema.parse(await body(req))) }); } catch (e) { return failure(e); } }
export async function DELETE(req: Request) { try { const user = await identity(req); await storage().remove(user, removeSchema.parse(await body(req))); return json({ ok: true }); } catch (e) { return failure(e); } }
