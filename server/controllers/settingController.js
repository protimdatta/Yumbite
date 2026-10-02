import Setting from '../models/Setting.js';

// GET /api/settings — public operational settings (no secrets live here)
export const getSettings = async (req, res) => {
  try {
    const data = await Setting.getAllSettings();
    console.log('Get settings data:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/settings (admin) — update allowed keys only
export const updateSettings = async (req, res) => {
  try {
    const entries = Object.entries(req.body || {});
    if (entries.length === 0) {
      return res.status(400).json({ success: false, message: 'No settings provided' });
    }
    for (const [key, value] of entries) {
      try {
        await Setting.setSetting(key, value);
      } catch (e) {
        if (e.code === 'BAD_SETTING') {
          return res.status(400).json({ success: false, message: e.message });
        }
        throw e;
      }
    }
    res.json({ success: true, data: await Setting.getAllSettings() });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};