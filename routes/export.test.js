import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../server.js';
import { saveData } from '../data/store.js';
import { clearTokens } from '../middleware/auth.js';

const defaultData = {
  adminPin: "8888",
  members: ["李卓", "晋华", "珊珊", "晓梅", "张伟"],
  tasks: [],
  currentWeek: null,
};

let server;
let baseUrl;

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      headers: { ...headers },
    };
    if (body) options.headers['Content-Type'] = 'application/json';
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'] || '',
          body: Buffer.concat(chunks),
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

describe('Export routes — auth gate', () => {
  before((_, done) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  beforeEach(() => {
    saveData({ ...defaultData, members: [...defaultData.members], tasks: [] });
    clearTokens();
  });

  it('GET /api/export/image without token returns 401', async () => {
    const res = await request('GET', '/api/export/image');
    assert.equal(res.status, 401);
  });

  it('GET /api/export/image with malformed Authorization returns 401', async () => {
    const res = await request('GET', '/api/export/image', null, { Authorization: 'BadFormat xyz' });
    assert.equal(res.status, 401);
  });

  it('GET /api/export/image with bogus bearer token returns 401', async () => {
    const res = await request('GET', '/api/export/image', null, { Authorization: 'Bearer not-a-real-token' });
    assert.equal(res.status, 401);
  });
});
