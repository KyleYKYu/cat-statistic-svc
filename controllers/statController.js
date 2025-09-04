const statModel = require('../models/statModel');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Middleware for handling file uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

async function getStats(req, res, next) {
  try {
    const { HOSPITAL_CODES, METRICS, DATE_FROM, DATE_TO } = req.query;
    const stats = await statModel.getStats(HOSPITAL_CODES, METRICS, DATE_FROM, DATE_TO);
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

    const METRICS = req.body.METRICS ? req.body.METRICS.replace(/^"|"$/g, '') : null; // Remove quotes if present
    const YEAR = req.body.YEAR ? req.body.YEAR.replace(/^"|"$/g, '') : null; // Remove quotes if present
    const MONTH = req.body.MONTH ? req.body.MONTH.replace(/^"|"$/g, '') : null; // Remove quotes if present
    if (!METRICS || !YEAR || !MONTH) {
      return res.status(400).json({ error: 'Metadata is required' });
    }
    await statModel.delStat(METRICS, YEAR, MONTH);

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
            const {
              HOSP_CODE, NORMALCOUNT, PRIORITYCOUNT, CHEST_PAIN_CASE_WITH_ECG_AVAILABLE,
              ECG_NOTE_UPDATE, ECG_DELETE, NORMALGROUPCOUNT, PRIORITYGROUPCOUNT,
              NORMALINDIVIDUALCOUNT, PRIORITYINDIVIDUALCOUNT, PATIENT_HOSP_CODE,
              USER_SPECIALTY, USERSPECIALTY, TOTAL, RANK_ALIAS, RANKALIAS, PATIENT_TYPE,
              UNIQUE_PATIENT, ACTIVATION_NUMBER, MESSAGE_SENT, MESSAGE_REPLIED } = stat;

            switch (METRICS) {
              case 'MEMO_CREATE':
              case 'MEMO_DELETE':
              case 'MEMO_COMPLETE':
              case 'MEMO_REPLY':
              case 'MEMO_REDUCT_REPLY':
              case 'MEMO_SHARE':
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "NORMAL", NORMALCOUNT, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "PRIORITY", PRIORITYCOUNT, null, null, null, YEAR, MONTH);
                break;
              case 'HA_CHAT_DETAIL':
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "NORMALGROUPCOUNT", NORMALGROUPCOUNT, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "PRIORITYGROUPCOUNT", PRIORITYGROUPCOUNT, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "NORMALINDIVIDUALCOUNT", NORMALINDIVIDUALCOUNT, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "PRIORITYINDIVIDUALCOUNT", PRIORITYINDIVIDUALCOUNT, null, null, null, YEAR, MONTH);
                break;
              case 'CAT_PATIENT_LIST_OPEN':
              case 'CAT_MEMO_PREVIEW':
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "TOTAL", TOTAL, null, null, null, YEAR, MONTH);
                break;
              case 'CHEST_PAIN_GREEN_CHANNEL':
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "CHEST_PAIN_CASE_WITH_ECG_AVAILABLE", CHEST_PAIN_CASE_WITH_ECG_AVAILABLE, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "ECG_NOTE_UPDATE", ECG_NOTE_UPDATE, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "ECG_DELETE", ECG_DELETE, null, null, null, YEAR, MONTH);
                break;
              case 'STROKE_GREEN_CHANNEL_1ST_TERR':
              case 'STROKE_GREEN_CHANNEL_2ND_TERR':
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "UNIQUE_PATIENT", UNIQUE_PATIENT, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "ACTIVATION_NUMBER", ACTIVATION_NUMBER, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "MESSAGE_SENT", MESSAGE_SENT, null, null, null, YEAR, MONTH);
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "MESSAGE_REPLIED", MESSAGE_REPLIED, null, null, null, YEAR, MONTH);
                break;
              case 'MEMO_CREATE_USER_SPECIALTY':
                await statModel.addStat(getCluster(PATIENT_HOSP_CODE), PATIENT_HOSP_CODE, METRICS, "TOTAL", TOTAL, null, USER_SPECIALTY, null, YEAR, MONTH);
                break;
              case 'MEMO_CREATE_USER_SPECIALTY_BY_RANK':
                await statModel.addStat(getCluster(PATIENT_HOSP_CODE), PATIENT_HOSP_CODE, METRICS, "TOTAL", TOTAL, RANKALIAS, USERSPECIALTY, null, YEAR, MONTH);
                break;
              case 'MEMO_CREATE_USER_RANK':
                await statModel.addStat(getCluster(PATIENT_HOSP_CODE), PATIENT_HOSP_CODE, METRICS, "TOTAL", TOTAL, RANK_ALIAS, null, null, YEAR, MONTH);
                break;
              case 'PATIENT_TYPE':
                await statModel.addStat(getCluster(HOSP_CODE), HOSP_CODE, METRICS, "TOTAL", TOTAL, null, null, PATIENT_TYPE, YEAR, MONTH);
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
    DKC: "HKWC",
    FYK: "HKWC",
    GH: "HKWC",
    ML: "HKWC",
    QMH: "HKWC",
    TWH: "HKWC",
    TYH: "HKWC",
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