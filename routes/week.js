import { Router } from 'express';
import { getData, saveData } from '../data/store.js';
import { requireAdmin } from '../middleware/auth.js';

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

export default router;
