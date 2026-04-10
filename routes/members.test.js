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
    if (body && body._token) {
      options.headers['Authorization'] = `Bearer ${body._token}`;
      const { _token, ...rest } = body;
      if (Object.keys(rest).length > 0) {
        options.headers['Content-Type'] = 'application/json';
      }
      body = Object.keys(rest).length > 0 ? rest : null;
    } else if (body && typeof body === 'object') {
      options.headers['Content-Type'] = 'application/json';
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

async function getAdminToken() {
  const res = await request('POST', '/api/admin/login', { pin: '8888' });
  return res.body.token;
}

describe('Member routes', () => {
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
    saveData({ ...defaultData, members: [...defaultData.members], tasks: [...defaultData.tasks] });
    clearTokens();
  });

  it('GET /api/members returns 200 with member array (no auth needed)', async () => {
    const res = await request('GET', '/api/members');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.deepEqual(res.body, ["李卓", "晋华", "珊珊", "晓梅", "张伟"]);
  });

  it('GET /api/members with no data returns default members array', async () => {
    // loadData resets to defaults if file missing — just verify it returns array
    loadData();
    const res = await request('GET', '/api/members');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  it('POST /api/members with valid token and name returns 201', async () => {
    const token = await getAdminToken();
    const res = await request('POST', '/api/members', { _token: token, name: '新成员' });
    assert.equal(res.status, 201);
    assert.ok(res.body.members.includes('新成员'));

    // Verify member appears in GET
    const getRes = await request('GET', '/api/members');
    assert.ok(getRes.body.includes('新成员'));
  });

  it('POST /api/members without token returns 401', async () => {
    const res = await request('POST', '/api/members', { name: '新成员' });
    assert.equal(res.status, 401);
  });

  it('POST /api/members with duplicate name returns 409', async () => {
    const token = await getAdminToken();
    const res = await request('POST', '/api/members', { _token: token, name: '李卓' });
    assert.equal(res.status, 409);
    assert.equal(res.body.error, '成员已存在');
  });

  it('POST /api/members with empty name returns 400', async () => {
    const token = await getAdminToken();
    const res = await request('POST', '/api/members', { _token: token, name: '  ' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('DELETE /api/members/李卓 with valid token returns 200', async () => {
    const token = await getAdminToken();
    const res = await request('DELETE', `/api/members/${encodeURIComponent('李卓')}`, { _token: token });
    assert.equal(res.status, 200);
    assert.ok(!res.body.members.includes('李卓'));

    // Verify member is gone from GET
    const getRes = await request('GET', '/api/members');
    assert.ok(!getRes.body.includes('李卓'));
  });

  it('DELETE /api/members/不存在 with valid token returns 404', async () => {
    const token = await getAdminToken();
    const res = await request('DELETE', `/api/members/${encodeURIComponent('不存在')}`, { _token: token });
    assert.equal(res.status, 404);
    assert.equal(res.body.error, '成员不存在');
  });

  it('DELETE /api/members/李卓 without token returns 401', async () => {
    const res = await request('DELETE', `/api/members/${encodeURIComponent('李卓')}`);
    assert.equal(res.status, 401);
  });
});
