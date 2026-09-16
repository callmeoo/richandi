import { pgTable, text, integer, bigint, jsonb, primaryKey, index } from 'drizzle-orm/pg-core';
import type { Content } from '../lib/knowledge';
const timestamp = (name: string) => bigint(name, { mode: 'number' });
export const libraries = pgTable('libraries', { userId: text('user_id').primaryKey(), createdAt: timestamp('created_at').notNull() });
export const cards = pgTable('cards', {
  id: text('id').notNull(), userId: text('user_id').notNull(), content: jsonb('content').$type<Content>().notNull(),
  createdAt: timestamp('created_at').notNull(), updatedAt: timestamp('updated_at').notNull(),
  correct: integer('correct').notNull().default(0), wrong: integer('wrong').notNull().default(0), streak: integer('streak').notNull().default(0),
  lastReview: timestamp('last_review'), nextReview: timestamp('next_review').notNull(), lastResult: text('last_result'), version: integer('version').notNull().default(1),
}, t => [primaryKey({ columns: [t.userId, t.id] })]);
export const reviews = pgTable('reviews', {
  id: text('id').notNull(), userId: text('user_id').notNull(), cardId: text('card_id').notNull(), correct: integer('correct').notNull(),
  reviewedAt: timestamp('reviewed_at').notNull(), mode: text('mode').notNull(), response: text('response').notNull(),
}, t => [primaryKey({ columns: [t.userId, t.id] }), index('idx_reviews_user_time').on(t.userId, t.reviewedAt)]);
