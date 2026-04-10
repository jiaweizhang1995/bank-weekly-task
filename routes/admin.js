import { Router } from 'express';
import { getData, saveData } from '../data/store.js';
import { generateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /login - Admin login with PIN
router.post('/login', (req, res) => {
  const { pin } = req.body || {};
  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: '请提供PIN码' });
  }
  const data = getData();
  if (pin !== data.adminPin) {
    return res.status(401).json({ error: 'PIN码错误' });
  }
  const token = generateToken();
  res.json({ token });
});

// PUT /pin - Change admin PIN (requires auth)
router.put('/pin', requireAdmin, (req, res) => {
  const { oldPin, newPin } = req.body || {};
  if (!newPin || typeof newPin !== 'string' || newPin.length < 4 || newPin.length > 8) {
    return res.status(400).json({ error: '新PIN码必须为4-8位' });
  }
  const data = getData();
  if (oldPin !== data.adminPin) {
    return res.status(403).json({ error: '原PIN码错误' });
  }
  data.adminPin = newPin;
  saveData(data);
  res.json({ message: 'PIN码已更新' });
});

export default router;
