const statModel = require('../models/statModel');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Middleware for handling file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files


async function getAllStats(req, res, next) {
  try {
    const stats = await statModel.getAllStat();
    res.json(stats);
  } catch (err) {
    next(err); // Pass error to error-handling middleware
  }
}

async function getStats(req, res, next) {
  try {
    const { HOSPITAL_CODE, METRICS, DATE_FROM, DATE_TO } = req.query;
    const stats = await statModel.getStats(HOSPITAL_CODE, METRICS, DATE_FROM, DATE_TO);
    res.json(stats);
  } catch (err) {
    next(err); // Pass error to error-handling middleware
  }
}

async function addStat(req, res, next) {
  try {
    // Extract values from the request body
    const { CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, RECORD_YEAR, RECORD_MONTH } = req.body;

    // Call the model function to add the stat
    const result = await statModel.addStat(CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, RECORD_YEAR, RECORD_MONTH);

    // Respond with the result
    res.status(201).json({ message: 'Stat added successfully', result });
  } catch (err) {
    next(err); // Pass error to error-handling middleware
  }
}

async function uploadCsv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);

    const stats = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        stats.push(row); // Push each row into the stats array
      })
      .on('end', async () => {
        try {
          // Insert each row into the database
          for (const stat of stats) {
            const { CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, RECORD_YEAR, RECORD_MONTH } = stat;
            
            console.log(stat);
            
            //await statModel.addStat(CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, RECORD_YEAR, RECORD_MONTH);
          }

          // Remove the temporary file
          fs.unlinkSync(filePath);

          res.status(201).json({ message: 'CSV file processed and data inserted successfully' });
        } catch (err) {
          next(err);
        }
      })
      .on('error', (err) => {
        next(err);
      });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getAllStats, addStat, uploadCsv };