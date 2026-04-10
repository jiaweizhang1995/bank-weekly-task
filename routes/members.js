import { Router } from 'express';
import { getData, saveData } from '../data/store.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET / - List all members (public, no auth needed per AUTH-04)
router.get('/', (req, res) => {
  const data = getData();
  res.json(data.members);
});

// POST / - Add a member (admin only)
router.post('/', requireAdmin, (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: '请提供成员名称' });
  }
  const data = getData();
  if (data.members.includes(name.trim())) {
    return res.status(409).json({ error: '成员已存在' });
  }
  data.members.push(name.trim());
  saveData(data);
  res.status(201).json({ message: '成员已添加', members: data.members });
});

// DELETE /:name - Remove a member (admin only)
router.delete('/:name', requireAdmin, (req, res) => {
  const name = req.params.name;
  const data = getData();
  const idx = data.members.indexOf(name);
  if (idx === -1) {
    return res.status(404).json({ error: '成员不存在' });
  }
  data.members.splice(idx, 1);
  saveData(data);
  res.json({ message: '成员已删除', members: data.members });
});

export default router;
