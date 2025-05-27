const express = require('express');
const statRoutes = require('./statRoutes');

const router = express.Router();

router.use('/stat', statRoutes);

module.exports = router;