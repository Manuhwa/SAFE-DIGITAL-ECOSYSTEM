const express = require('express');
const router = express.Router();
const { runPatternAnalysis } = require('../services/patternAnalysis');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.post('/run', (req, res) => {
  try {
    const result = runPatternAnalysis();
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Pattern analysis failed.' });
  }
});

router.get('/latest', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT id, analysis_type, summary, insights, data_snapshot, created_at
      FROM pattern_analysis
      ORDER BY created_at DESC
      LIMIT 1
    `).get();
    if (!row) return res.json({ summary: {}, insights: [], message: 'No analysis run yet.' });
    res.json({
      id: row.id,
      analysisType: row.analysis_type,
      summary: JSON.parse(row.summary || '{}'),
      insights: (row.insights || '').split(/\s*\.\s*/).filter(Boolean),
      createdAt: row.created_at
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
});

router.get('/history', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, analysis_type, created_at
      FROM pattern_analysis
      ORDER BY created_at DESC
      LIMIT 20
    `).all();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

module.exports = router;
