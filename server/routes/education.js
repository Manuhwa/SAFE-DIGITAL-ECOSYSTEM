const express = require('express');
const router = express.Router();
const educationContent = require('../data/educationContent');

router.get('/', (_, res) => {
  res.json(educationContent);
});

router.get('/:id', (req, res) => {
  const item = educationContent.find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

module.exports = router;
