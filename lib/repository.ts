import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { seeds, quickEntrySeed, isLearnable, type Card, type Content } from './knowledge';
import { schedule } from './scheduling';
import { ApiError } from './errors';
type Database = NodePgDatabase<typeof schema>;
const { cards, libraries, reviews } = schema;
const owned = (user: string, id: string) => and(eq(cards.userId, user), eq(cards.id, id));
function toCard(row: typeof cards.$inferSelect): Card {
  const { content, userId: _userId, ...record } = row;
  void _userId;
  return { ...content, ...record };
}
export function repository(database: Database) {
  async function initialize(user: string) {
    await database.transaction(async tx => {
      const now = Date.now();
      const inserted = await tx.insert(libraries).values({ userId: user, createdAt: now }).onConflictDoNothing().returning();
      if (!inserted.length) return;
      await tx.insert(cards).values(seeds.map((content, i) => ({ id: `seed-${i + 1}`, userId: user, content, createdAt: now, updatedAt: now, nextReview: now }))).onConflictDoNothing();
    });
  }
  async function list(user: string) {
    await initialize(user);
    return (await database.select().from(cards).where(eq(cards.userId, user)).orderBy(desc(cards.createdAt), asc(cards.id))).map(toCard);
  }
  async function create(user: string, data: { id: string; content: Content }) {
    await initialize(user);
    const curated = quickEntrySeed(data.content);
    if (curated) {
      const [existing] = await database.select().from(cards).where(and(eq(cards.userId, user), sql`lower(${cards.content}->>'en') = lower(${curated.en})`)).orderBy(asc(cards.createdAt)).limit(1);
      if (existing) return { card: toCard(existing), reused: true };
    }
    const now = Date.now();
    await database.insert(cards).values({ id: data.id, userId: user, content: curated || data.content, createdAt: now, updatedAt: now, nextReview: now }).onConflictDoNothing();
    const [row] = await database.select().from(cards).where(owned(user, data.id));
    if (!row) throw new ApiError(409, '卡片已在另一处删除，请重试');
    return { card: toCard(row), reused: false };
  }
  async function update(user: string, data: { id: string; version: number; content: Content }) {
    const [row] = await database.update(cards).set({ content: data.content, updatedAt: Date.now(), version: sql`${cards.version} + 1` }).where(and(owned(user, data.id), eq(cards.version, data.version))).returning();
    if (!row) throw new ApiError(409, '卡片已在另一处更新，请先复制修改内容，关闭后刷新卡片再编辑');
    return toCard(row);
  }
  async function remove(user: string, data: { id: string; version: number }) {
    const removed = await database.delete(cards).where(and(owned(user, data.id), eq(cards.version, data.version))).returning({ id: cards.id });
    if (!removed.length) throw new ApiError(409, '卡片已更新，请刷新后重试');
  }
  async function review(user: string, data: { id: string; cardId: string; version: number; correct: boolean; mode: 'review' | 'exam'; response: string }) {
    return database.transaction(async tx => {
      // Serialize retries sharing an ID, including accidental reuse for another card.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${JSON.stringify([user, data.id])}, 0))`);
      const [row] = await tx.select().from(cards).where(owned(user, data.cardId)).for('update');
      if (!row) throw new ApiError(404, '这张卡片已被删除');
      const card = toCard(row);
      const [prior] = await tx.select().from(reviews).where(and(eq(reviews.userId, user), eq(reviews.id, data.id)));
      if (prior) {
        if (prior.cardId !== data.cardId || prior.correct !== Number(data.correct)) throw new ApiError(409, '本次答案已提交，请继续下一题');
        return card;
      }
      if (!isLearnable(card)) throw new ApiError(400, '请先补充解释或参考答案');
      if (card.version !== data.version) throw new ApiError(409, '卡片已在另一设备更新，请重新加载本题');
      const now = Date.now(), next = schedule(card, data.correct, now);
      await tx.insert(reviews).values({ id: data.id, userId: user, cardId: data.cardId, correct: Number(data.correct), reviewedAt: now, mode: data.mode, response: data.response });
      const [updated] = await tx.update(cards).set({ correct: card.correct + Number(data.correct), wrong: card.wrong + Number(!data.correct), streak: next.streak, lastReview: now, nextReview: next.nextReview, lastResult: next.lastResult, updatedAt: now, version: card.version + 1 }).where(owned(user, data.cardId)).returning();
      return toCard(updated);
    });
  }
  return { list, create, update, remove, review };
}
