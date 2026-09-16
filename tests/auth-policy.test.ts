import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isOwner, assertSameOrigin } from '../lib/auth/policy';
test('only the configured, verified owner can access knowledge', () => {
  assert.equal(isOwner({ email: 'OWNER@example.com', emailVerified: true }, 'owner@example.com'), true);
  assert.equal(isOwner({ email: 'owner@example.com', emailVerified: false }, 'owner@example.com'), false);
  assert.equal(isOwner({ email: 'other@example.com', emailVerified: true }, 'owner@example.com'), false);
  assert.equal(isOwner({ email: 'owner@example.com', emailVerified: true }, undefined), false);
});
test('mutations require matching Origin, including when legacy identity headers are supplied', () => {
  assert.doesNotThrow(() => assertSameOrigin(new Request('https://knowledge.example/api/cards', { method: 'POST', headers: { origin: 'https://knowledge.example' } })));
  for (const origin of [undefined, 'https://evil.example', 'null']) {
    const headers = new Headers({ 'oai-authenticated-user-id': 'owner', 'oai-authenticated-user-email': 'owner@example.com' });
    if (origin) headers.set('origin', origin);
    assert.throws(() => assertSameOrigin(new Request('https://knowledge.example/api/cards', { method: 'POST', headers })), { status: 403 });
  }
});
