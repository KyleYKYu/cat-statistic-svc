const express = require('express');
const statController = require('../controllers/statController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

router.get('/stats', statController.getStats);

//router.post('/new', statController.addStat);

router.post('/upload-csv', upload.single('file'), statController.uploadCsv);

module.exports = router;