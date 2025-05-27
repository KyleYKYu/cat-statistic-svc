const express = require('express');
const statController = require('../controllers/statController');

const router = express.Router();

router.get('/stats', statController.getStats);

router.get('/all', statController.getAllStats);

router.post('/new', statController.addStat);

module.exports = router;