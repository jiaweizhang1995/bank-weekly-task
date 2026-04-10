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

async function getToken() {
  const res = await request('POST', '/api/admin/login', { pin: '8888' });
  return res.body.token;
}

describe('Week routes', () => {
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

  it('GET /api/week with null currentWeek returns 200 with default structure', async () => {
    const res = await request('GET', '/api/week');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.tasks, []);
    assert.deepEqual(res.body.status, {});
    assert.equal(res.body.penalty, "");
    assert.equal(res.body.deadline, "");
    assert.equal(res.body.announcement, "");
  });

  it('GET /api/week after setting data returns complete week object', async () => {
    const weekData = {
      tasks: [{ id: "123", name: "test", desc: "desc" }],
      status: { "李卓": { "123": "done" } },
      penalty: "50元",
      deadline: "2026-04-15T18:00",
      announcement: "测试公告",
    };
    const data = { ...defaultData, members: [...defaultData.members], tasks: [], currentWeek: weekData };
    saveData(data);

    const res = await request('GET', '/api/week');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.tasks, weekData.tasks);
    assert.deepEqual(res.body.status, weekData.status);
    assert.equal(res.body.penalty, "50元");
    assert.equal(res.body.deadline, "2026-04-15T18:00");
    assert.equal(res.body.announcement, "测试公告");
  });

  it('PUT /api/week/announcement with token updates announcement', async () => {
    const token = await getToken();
    const res = await request('PUT', '/api/week/announcement', {
      _token: token,
      announcement: "新公告",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.announcement, "新公告");

    // Verify GET reflects the change
    const getRes = await request('GET', '/api/week');
    assert.equal(getRes.body.announcement, "新公告");
  });

  it('PUT /api/week/announcement without token returns 401', async () => {
    const res = await request('PUT', '/api/week/announcement', { announcement: "test" });
    assert.equal(res.status, 401);
  });

  it('PUT /api/week/announcement with missing field returns 400', async () => {
    const token = await getToken();
    const res = await request('PUT', '/api/week/announcement', { _token: token });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('PUT /api/week/announcement with empty string clears announcement', async () => {
    const token = await getToken();
    // First set an announcement
    await request('PUT', '/api/week/announcement', { _token: token, announcement: "有内容" });
    // Then clear it
    const res = await request('PUT', '/api/week/announcement', { _token: token, announcement: "" });
    assert.equal(res.status, 200);
    assert.equal(res.body.announcement, "");

    const getRes = await request('GET', '/api/week');
    assert.equal(getRes.body.announcement, "");
  });

  it('PUT /api/week/settings with token and both fields returns 200', async () => {
    const token = await getToken();
    const res = await request('PUT', '/api/week/settings', {
      _token: token,
      deadline: "2026-04-15T18:00",
      penalty: "50元",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.deadline, "2026-04-15T18:00");
    assert.equal(res.body.penalty, "50元");
  });

  it('PUT /api/week/settings with only deadline updates deadline, penalty unchanged', async () => {
    const token = await getToken();
    // First set both
    await request('PUT', '/api/week/settings', {
      _token: token,
      deadline: "2026-04-15T18:00",
      penalty: "原始惩罚",
    });
    // Then update only deadline
    const res = await request('PUT', '/api/week/settings', {
      _token: token,
      deadline: "2026-04-20T18:00",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.deadline, "2026-04-20T18:00");
    assert.equal(res.body.penalty, "原始惩罚");
  });

  it('PUT /api/week/settings without token returns 401', async () => {
    const res = await request('PUT', '/api/week/settings', { deadline: "2026-04-15T18:00" });
    assert.equal(res.status, 401);
  });

  it('PUT /api/week/settings with empty body returns 400', async () => {
    const token = await getToken();
    const res = await request('PUT', '/api/week/settings', { _token: token });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});
