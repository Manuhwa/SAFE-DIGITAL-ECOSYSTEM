const express = require('express');
const router = express.Router();
const legalContent = require('../data/legalContent');

router.get('/', (_, res) => {
  res.json(legalContent);
});

module.exports = router;
