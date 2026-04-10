// src/api.js

const BASE = '/api';
let adminToken = null;

function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  return headers;
}

async function request(method, path, body) {
  const opts = { method, headers: authHeaders() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}

const api = {
  // Auth
  async login(pin) {
    const data = await request('POST', '/admin/login', { pin });
    adminToken = data.token;
    return data;
  },
  logout() {
    adminToken = null;
  },
  isLoggedIn() {
    return adminToken !== null;
  },
  async changePin(oldPin, newPin) {
    return request('PUT', '/admin/pin', { oldPin, newPin });
  },

  // Members
  async getMembers() {
    return request('GET', '/members');
  },
  async addMember(name) {
    return request('POST', '/members', { name });
  },
  async deleteMember(name) {
    return request('DELETE', `/members/${encodeURIComponent(name)}`);
  },

  // Week
  async getWeek() {
    return request('GET', '/week');
  },
  async updateAnnouncement(announcement) {
    return request('PUT', '/week/announcement', { announcement });
  },
  async updateSettings(settings) {
    return request('PUT', '/week/settings', settings);
  },
  async addTask(name, desc) {
    return request('POST', '/week/tasks', { name, desc });
  },
  async deleteTask(taskId) {
    return request('DELETE', `/week/tasks/${taskId}`);
  },
  async updateStatus(taskId, member, status) {
    return request('PUT', `/week/tasks/${taskId}/status/${encodeURIComponent(member)}`, { status });
  },
  async resetWeek() {
    return request('POST', '/week/reset');
  },
};

export default api;
