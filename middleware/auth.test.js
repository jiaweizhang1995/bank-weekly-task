import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, verifyToken, requireAdmin, clearTokens, _setTTL } from './auth.js';

describe('generateToken', () => {
  beforeEach(() => {
    clearTokens();
  });

  it('returns a 64-character hex string', () => {
    const token = generateToken();
    assert.equal(token.length, 64);
    assert.match(token, /^[0-9a-f]{64}$/);
  });

  it('produces different tokens on successive calls', () => {
    const t1 = generateToken();
    const t2 = generateToken();
    assert.notEqual(t1, t2);
  });
});

describe('verifyToken', () => {
  beforeEach(() => {
    clearTokens();
    _setTTL(86400000); // reset to default 24h
  });

  it('returns true for a valid generated token', () => {
    const token = generateToken();
    assert.equal(verifyToken(token), true);
  });

  it('returns false for an invalid token', () => {
    assert.equal(verifyToken('invalid-garbage'), false);
  });

  it('returns false for an expired token', () => {
    _setTTL(0); // expire immediately
    const token = generateToken();
    assert.equal(verifyToken(token), false);
  });
});

describe('requireAdmin middleware', () => {
  beforeEach(() => {
    clearTokens();
    _setTTL(86400000);
  });

  it('calls next() when valid Bearer token is provided', async () => {
    const token = generateToken();
    let nextCalled = false;
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status() { return this; },
      json() {},
    };
    const next = () => { nextCalled = true; };

    requireAdmin(req, res, next);
    assert.equal(nextCalled, true);
  });

  it('returns 401 when no Authorization header', () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { headers: {} };
    const res = {
      status(code) { statusCode = code; return this; },
      json(body) { jsonBody = body; },
    };
    const next = () => { throw new Error('next should not be called'); };

    requireAdmin(req, res, next);
    assert.equal(statusCode, 401);
    assert.ok(jsonBody.error);
  });

  it('returns 401 when token is invalid', () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { headers: { authorization: 'Bearer bad-token-value' } };
    const res = {
      status(code) { statusCode = code; return this; },
      json(body) { jsonBody = body; },
    };
    const next = () => { throw new Error('next should not be called'); };

    requireAdmin(req, res, next);
    assert.equal(statusCode, 401);
    assert.ok(jsonBody.error);
  });
});
