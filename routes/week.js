import { Router } from 'express';
import { getData, saveData } from '../data/store.js';
import { requireAdmin, verifyToken } from '../middleware/auth.js';

const router = Router();

const DEFAULT_WEEK = { tasks: [], status: {}, penalty: "", deadline: "", announcement: "" };

// GET / - Get current week data (public, no auth needed per WEEK-01)
router.get('/', (req, res) => {
  const data = getData();
  const week = data.currentWeek || DEFAULT_WEEK;
  res.json(week);
});

// PUT /announcement - Update weekly announcement (admin only per WEEK-02)
router.put('/announcement', requireAdmin, (req, res) => {
  if (!req.body || !('announcement' in req.body)) {
    return res.status(400).json({ error: '请提供公告内容' });
  }
  const data = getData();
  if (!data.currentWeek) {
    data.currentWeek = { ...DEFAULT_WEEK };
  }
  data.currentWeek.announcement = req.body.announcement;
  saveData(data);
  res.json({ message: '公告已更新', announcement: data.currentWeek.announcement });
});

// PUT /settings - Update deadline and penalty (admin only per WEEK-03)
router.put('/settings', requireAdmin, (req, res) => {
  if (!req.body || (!('deadline' in req.body) && !('penalty' in req.body))) {
    return res.status(400).json({ error: '请提供截止时间或惩罚设置' });
  }
  const data = getData();
  if (!data.currentWeek) {
    data.currentWeek = { ...DEFAULT_WEEK };
  }
  if ('deadline' in req.body) data.currentWeek.deadline = req.body.deadline;
  if ('penalty' in req.body) data.currentWeek.penalty = req.body.penalty;
  saveData(data);
  res.json({ message: '设置已更新', deadline: data.currentWeek.deadline, penalty: data.currentWeek.penalty });
});

// POST /tasks - Add a new task (admin only per WEEK-04)
router.post('/tasks', requireAdmin, (req, res) => {
  const { name, desc } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '请提供任务名称' });
  }
  const data = getData();
  if (!data.currentWeek) {
    data.currentWeek = { tasks: [], status: {}, penalty: "", deadline: "", announcement: "" };
  }
  const task = { id: Date.now().toString(), name: name.trim(), desc: (desc || "").trim() };
  data.currentWeek.tasks.push(task);
  saveData(data);
  res.status(201).json({ message: '任务已添加', task });
});

// DELETE /tasks/:taskId - Remove a task (admin only per WEEK-05)
router.delete('/tasks/:taskId', requireAdmin, (req, res) => {
  const { taskId } = req.params;
  const data = getData();
  if (!data.currentWeek) {
    data.currentWeek = { tasks: [], status: {}, penalty: "", deadline: "", announcement: "" };
  }
  const idx = data.currentWeek.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) {
    return res.status(404).json({ error: '任务不存在' });
  }
  data.currentWeek.tasks.splice(idx, 1);
  // Clean up status entries for this task
  const status = data.currentWeek.status;
  for (const member of Object.keys(status)) {
    if (status[member] && taskId in status[member]) {
      delete status[member][taskId];
    }
  }
  saveData(data);
  res.json({ message: '任务已删除' });
});

// PUT /tasks/:taskId/status/:member - Update task status (conditional auth per STAT-01, STAT-02, STAT-03)
router.put('/tasks/:taskId/status/:member', (req, res) => {
  const { taskId, member } = req.params;
  const body = req.body || {};
  const statusVal = body.status;

  // Validate status value
  if (statusVal !== 'done' && statusVal !== 'rejected' && statusVal !== null) {
    return res.status(400).json({ error: '状态值无效，必须为 done、rejected 或 null' });
  }

  const data = getData();
  if (!data.currentWeek) {
    data.currentWeek = { tasks: [], status: {}, penalty: "", deadline: "", announcement: "" };
  }

  // Validate member exists
  if (!data.members.includes(member)) {
    return res.status(404).json({ error: '成员不存在' });
  }

  // Validate task exists
  if (!data.currentWeek.tasks.find(t => t.id === taskId)) {
    return res.status(404).json({ error: '任务不存在' });
  }

  // Auth logic: "rejected" and null require admin token
  if (statusVal === 'rejected' || statusVal === null) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ') || !verifyToken(auth.slice(7))) {
      return res.status(401).json({ error: '未授权，请先登录' });
    }
  }

  // Update status
  if (!data.currentWeek.status[member]) data.currentWeek.status[member] = {};
  data.currentWeek.status[member][taskId] = statusVal;
  saveData(data);
  res.json({ message: '状态已更新', member, taskId, status: statusVal });
});

export default router;
