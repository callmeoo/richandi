import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { repository } from '../lib/repository';
import * as schema from '../db/schema';
import { blankContent } from '../lib/knowledge';

test('Postgres migration, persistence, ownership, conflicts and retry-safe reviews', async () => {
  const client = new PGlite();
  const database = drizzle(client, { schema });
  // PGlite runs the PostgreSQL engine; only the driver's result HKT differs from pg.
  const store = repository(database as unknown as Parameters<typeof repository>[0]);
  try {
    await migrate(database, { migrationsFolder: './drizzle-postgres' });
    await migrate(database, { migrationsFolder: './drizzle-postgres' });
    assert.equal((await store.list('alice')).length, 5);
    assert.equal((await store.list('alice')).length, 5);
    assert.equal((await store.list('bob')).length, 5);
    const content = { ...blankContent, zh: '事务隔离', explanation: '测试并发提交', example: '保留中文与单引号 \' 内容' };
    const id = randomUUID();
    const created = await store.create('alice', { id, content });
    assert(created.card.createdAt > 2 ** 31);
    assert.equal(created.card.example, content.example);
    await store.create('alice', { id, content });
    assert.equal((await store.list('alice')).length, 6);
    assert.equal((await store.list('bob')).some(c => c.id === id), false);
    await assert.rejects(store.update('bob', { id, version: 1, content }), { status: 409 });
    await assert.rejects(store.remove('bob', { id, version: 1 }), { status: 409 });
    const results = await Promise.allSettled([
      store.update('alice', { id, version: 1, content: { ...content, zh: '手机编辑' } }),
      store.update('alice', { id, version: 1, content: { ...content, zh: '电脑编辑' } }),
    ]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal(results.filter(r => r.status === 'rejected').length, 1);
    const submission = { id: randomUUID(), cardId: id, version: 2, correct: false, mode: 'review' as const, response: '不知道' };
    await assert.rejects(store.review('bob', submission), { status: 404 });
    const [first, duplicate] = await Promise.all([store.review('alice', submission), store.review('alice', submission)]);
    assert.equal(first.wrong, 1); assert.equal(duplicate.wrong, 1); assert.equal(duplicate.version, 3);
    assert.equal(first.nextReview - first.lastReview!, 600_000);
    await assert.rejects(store.review('alice', { ...submission, correct: true }), { status: 409 });
    await assert.rejects(store.review('alice', { ...submission, cardId: 'seed-1' }), { status: 409 });
    await assert.rejects(store.review('alice', { ...submission, id: randomUUID() }), { status: 409 });
    assert.equal((await database.select().from(schema.reviews)).length, 1);
    assert.equal((await store.list('alice')).find(c => c.id === id)?.wrong, 1);
    await store.remove('alice', { id, version: 3 });
    assert.equal((await store.list('alice')).length, 5);
    assert.equal((await store.list('bob')).length, 5);
    await store.remove('alice', { id: 'seed-1', version: 1 });
    assert.equal((await store.list('alice')).length, 4, 'deleted seeds must not reappear');
  } finally { await client.close(); }
});
