const statModel = require('../models/statModel');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Middleware for handling file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

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

    const { METRICS, YEAR, MONTH } = req.body; // Extract metadata from the request body
    if (!METRICS || !YEAR || !MONTH) {
      return res.status(400).json({ error: 'Metadata is required' });
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);

    const stats = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        stats.push({ ...row }); // Add metadata to each row
      })
      .on('end', async () => {
        try {
          // Insert each row into the database
          for (const stat of stats) {
            const { HOSP_CODE, NORMALCOUNT, PRIORITYCOUNT } = stat;
            
            switch (METRICS) {
              case MEMO_CREATE || MEMO_COMPLETE || MEMO_DELETE || MEMO_DEDUCT_REPLY || MEMO_REPLY:
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS.replace(/^"|"$/g, ''), "NORMAL", NORMALCOUNT, YEAR.replace(/^"|"$/g, ''), MONTH.replace(/^"|"$/g, ''));
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS.replace(/^"|"$/g, ''), "PRIORITY", PRIORITYCOUNT, YEAR.replace(/^"|"$/g, ''), MONTH.replace(/^"|"$/g, ''));
                break;
              default:
                break;
            }
          }

          // Remove the temporary file
          fs.unlinkSync(filePath);

          res.status(201).json({ message: 'CSV file with metadata processed and data inserted successfully' });
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

function getCluster(hospCode) {
  const cluster = {
    CHC: "HKEC",
    PYN: "HKEC",
    RH: "HKEC",
    SJH: "HKEC",
    TSK: "HKEC",
    TWE: "HKEC",
    WCH: "HKEC",
    DKC: "HKEC",
    FYK: "HKEC",
    GH: "HKEC",
    ML: "HKEC",
    QMH: "HKEC",
    TWH: "HKEC",
    TYH: "HKEC",
    BH: "KCC",	
    HCH: "KCC",	
    HKE: "KCC",	
    KH: "KCC",	
    KWH: "KCC",	
    OLM: "KCC",	
    QEH: "KCC",	
    WTS: "KCC",
    HHH: "KEC",
    TKO: "KEC",	
    UCH: "KEC",
    CMC: "KWC",	
    KCH: "KWC",	
    NLT: "KWC",	
    PMH: "KWC",	
    YCH: "KWC",
    AHN: "NTEC",	
    BBH: "NTEC",	
    CHS: "NTEC",	
    NDH: "NTEC",	
    PWH: "NTEC",	
    SH: "NTEC",	
    TPH: "NTEC",
    CPH: "NTWC",	
    POH: "NTWC",	
    SLH: "NTWC",	
    TMH: "NTWC",	
    TSH: "NTWC"
  }

  return cluster[hospCode.toUpperCase()] || null;
}

module.exports = { getStats, addStat, uploadCsv };