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

  // =================== Task CRUD Tests ===================

  it('POST /api/week/tasks with token and valid body returns 201 with task', async () => {
    const token = await getToken();
    const res = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '写周报',
      desc: '总结',
    });
    assert.equal(res.status, 201);
    assert.ok(res.body.task);
    assert.ok(res.body.task.id);
    assert.equal(res.body.task.name, '写周报');
    assert.equal(res.body.task.desc, '总结');
  });

  it('POST /api/week/tasks with token and missing name returns 400', async () => {
    const token = await getToken();
    const res = await request('POST', '/api/week/tasks', {
      _token: token,
      desc: '无名任务',
    });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('POST /api/week/tasks without token returns 401', async () => {
    const res = await request('POST', '/api/week/tasks', { name: '测试' });
    assert.equal(res.status, 401);
  });

  it('DELETE /api/week/tasks/:taskId with token removes task', async () => {
    const token = await getToken();
    // Create a task first
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '待删任务',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    // Delete the task
    const delRes = await request('DELETE', `/api/week/tasks/${taskId}`, { _token: token });
    assert.equal(delRes.status, 200);

    // Verify task is gone
    const getRes = await request('GET', '/api/week');
    const found = getRes.body.tasks.find(t => t.id === taskId);
    assert.equal(found, undefined);
  });

  it('DELETE /api/week/tasks/:taskId with non-existent ID returns 404', async () => {
    const token = await getToken();
    const res = await request('DELETE', '/api/week/tasks/9999999', { _token: token });
    assert.equal(res.status, 404);
  });

  it('DELETE /api/week/tasks/:taskId without token returns 401', async () => {
    const res = await request('DELETE', '/api/week/tasks/123');
    assert.equal(res.status, 401);
  });

  it('DELETE /api/week/tasks/:taskId also removes taskId from member status entries', async () => {
    const token = await getToken();
    // Create a task
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '状态清理测试',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    // Mark it done for a member
    await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, { status: 'done' });

    // Verify status was set
    let getRes = await request('GET', '/api/week');
    assert.equal(getRes.body.status['李卓'][taskId], 'done');

    // Delete the task
    await request('DELETE', `/api/week/tasks/${taskId}`, { _token: token });

    // Verify status entry is cleaned up
    getRes = await request('GET', '/api/week');
    if (getRes.body.status['李卓']) {
      assert.equal(getRes.body.status['李卓'][taskId], undefined);
    }
  });

  // =================== Status Tests ===================

  it('PUT /api/week/tasks/:taskId/status/:member with done and NO token returns 200', async () => {
    const token = await getToken();
    // Create a task first
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '自行标记',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    // Member marks done without token
    const res = await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, { status: 'done' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'done');
  });

  it('PUT /api/week/tasks/:taskId/status/:member with rejected WITHOUT token returns 401', async () => {
    const token = await getToken();
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '拒绝测试',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    // Try to reject without token
    const res = await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, { status: 'rejected' });
    assert.equal(res.status, 401);
  });

  it('PUT /api/week/tasks/:taskId/status/:member with rejected WITH token returns 200', async () => {
    const token = await getToken();
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '拒绝测试2',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    const res = await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, {
      _token: token,
      status: 'rejected',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'rejected');
  });

  it('PUT /api/week/tasks/:taskId/status/:member with null WITH token returns 200', async () => {
    const token = await getToken();
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '重置状态测试',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    // First mark done
    await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, { status: 'done' });

    // Then admin resets to null
    const res = await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, {
      _token: token,
      status: null,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, null);
  });

  it('PUT /api/week/tasks/:taskId/status/:member with non-existent member returns 404', async () => {
    const token = await getToken();
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '成员不存在测试',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    const res = await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('不存在')}`, { status: 'done' });
    assert.equal(res.status, 404);
  });

  it('PUT /api/week/tasks/9999/status/:member with non-existent taskId returns 404', async () => {
    const res = await request('PUT', `/api/week/tasks/9999/status/${encodeURIComponent('李卓')}`, { status: 'done' });
    assert.equal(res.status, 404);
  });

  it('After status update, GET /api/week shows the updated status', async () => {
    const token = await getToken();
    const createRes = await request('POST', '/api/week/tasks', {
      _token: token,
      name: '状态反映测试',
      desc: '',
    });
    const taskId = createRes.body.task.id;

    // Mark done
    await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, { status: 'done' });

    // Verify in GET
    const getRes = await request('GET', '/api/week');
    assert.equal(getRes.body.status['李卓'][taskId], 'done');
  });

  // =================== Reset Tests ===================

  it('POST /api/week/reset with admin token resets all data to defaults', async () => {
    const token = await getToken();
    // Add some data first
    await request('POST', '/api/week/tasks', { _token: token, name: '待重置任务', desc: '' });
    await request('PUT', '/api/week/announcement', { _token: token, announcement: '重置前公告' });
    await request('PUT', '/api/week/settings', { _token: token, deadline: '2026-04-15T18:00', penalty: '50元' });

    // Reset
    const res = await request('POST', '/api/week/reset', { _token: token });
    assert.equal(res.status, 200);
    assert.equal(res.body.message, '周数据已重置');

    // Verify everything is cleared
    const getRes = await request('GET', '/api/week');
    assert.deepEqual(getRes.body.tasks, []);
    assert.deepEqual(getRes.body.status, {});
    assert.equal(getRes.body.announcement, '');
    assert.equal(getRes.body.deadline, '');
    assert.equal(getRes.body.penalty, '');
  });

  it('POST /api/week/reset without token returns 401', async () => {
    const res = await request('POST', '/api/week/reset');
    assert.equal(res.status, 401);
  });

  it('POST /api/week/reset clears tasks, statuses, and settings completely', async () => {
    const token = await getToken();
    // Create task and mark done
    const createRes = await request('POST', '/api/week/tasks', { _token: token, name: '完整重置测试', desc: '描述' });
    const taskId = createRes.body.task.id;
    await request('PUT', `/api/week/tasks/${taskId}/status/${encodeURIComponent('李卓')}`, { status: 'done' });

    // Reset
    await request('POST', '/api/week/reset', { _token: token });

    // Verify complete reset
    const getRes = await request('GET', '/api/week');
    assert.deepEqual(getRes.body.tasks, []);
    assert.deepEqual(getRes.body.status, {});
    assert.equal(getRes.body.penalty, '');
    assert.equal(getRes.body.deadline, '');
    assert.equal(getRes.body.announcement, '');
  });
});
