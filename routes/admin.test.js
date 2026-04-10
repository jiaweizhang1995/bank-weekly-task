import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../server.js';
import { loadData, saveData } from '../data/store.js';
import { clearTokens } from '../middleware/auth.js';

const defaultData = {
  adminPin: "8888",
  members: ["李卓", "晋华", "珊珊", "晓梅", "张伟"],
  tasks: [],
  currentWeek: null,
};

let server;
let baseUrl;

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: {},
    };
    if (body && typeof body === 'object' && !body._token) {
      options.headers['Content-Type'] = 'application/json';
    }
    if (body && body._token) {
      options.headers['Authorization'] = `Bearer ${body._token}`;
      const { _token, ...rest } = body;
      if (Object.keys(rest).length > 0) {
        options.headers['Content-Type'] = 'application/json';
      }
      body = Object.keys(rest).length > 0 ? rest : null;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Admin routes', () => {
  before((_, done) => {
    server = app.listen(0, () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  beforeEach(() => {
    // Reset data to defaults (previous tests may have modified PIN on disk)
    saveData({ ...defaultData, members: [...defaultData.members], tasks: [...defaultData.tasks] });
    clearTokens();
  });

  it('POST /api/admin/login with correct PIN returns 200 and token', async () => {
    const res = await request('POST', '/api/admin/login', { pin: '8888' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(typeof res.body.token, 'string');
  });

  it('POST /api/admin/login with wrong PIN returns 401', async () => {
    const res = await request('POST', '/api/admin/login', { pin: 'wrong' });
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
  });

  it('POST /api/admin/login with no body returns 400', async () => {
    const res = await request('POST', '/api/admin/login', {});
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('PUT /api/admin/pin without token returns 401', async () => {
    const res = await request('PUT', '/api/admin/pin', { oldPin: '8888', newPin: '1234' });
    assert.equal(res.status, 401);
  });

  it('PUT /api/admin/pin with valid token and correct oldPin updates PIN', async () => {
    // Login first
    const loginRes = await request('POST', '/api/admin/login', { pin: '8888' });
    const token = loginRes.body.token;

    // Change PIN
    const changeRes = await request('PUT', '/api/admin/pin', {
      _token: token,
      oldPin: '8888',
      newPin: '1234',
    });
    assert.equal(changeRes.status, 200);
    assert.ok(changeRes.body.message);

    // Verify new PIN works
    const newLoginRes = await request('POST', '/api/admin/login', { pin: '1234' });
    assert.equal(newLoginRes.status, 200);
    assert.ok(newLoginRes.body.token);

    // Verify old PIN no longer works
    const oldLoginRes = await request('POST', '/api/admin/login', { pin: '8888' });
    assert.equal(oldLoginRes.status, 401);
  });

  it('PUT /api/admin/pin with wrong oldPin returns 403', async () => {
    const loginRes = await request('POST', '/api/admin/login', { pin: '8888' });
    const token = loginRes.body.token;

    const res = await request('PUT', '/api/admin/pin', {
      _token: token,
      oldPin: 'wrong',
      newPin: '1234',
    });
    assert.equal(res.status, 403);
    assert.ok(res.body.error);
  });

  it('PUT /api/admin/pin with newPin too short returns 400', async () => {
    const loginRes = await request('POST', '/api/admin/login', { pin: '8888' });
    const token = loginRes.body.token;

    const res = await request('PUT', '/api/admin/pin', {
      _token: token,
      oldPin: '8888',
      newPin: '12',
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});
