const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

async function getStats(hospitalCodes, metrics, dateFrom, dateTo) {
  try {
    // Split the hospitalCode string and trim spaces from each value
    const hospitalCodesArray = hospitalCodes
      ? hospitalCodes.split(',').map(code => code.trim())
      : null;

    const query = hospitalCodesArray ? `
      SELECT RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, USER_RANK, USER_SPECIALTY, 
      EPISODE_TYPE, MONTH(RECORD_DATE) AS recordMonth, YEAR(RECORD_DATE) AS recordYear
      FROM STATISTIC
      WHERE HOSPITAL_CODE IN (?) AND METRICS = ? AND RECORD_DATE BETWEEN ? AND ?
    `: `
      SELECT RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, USER_RANK, USER_SPECIALTY, 
      EPISODE_TYPE, MONTH(RECORD_DATE) AS recordMonth, YEAR(RECORD_DATE) AS recordYear
      FROM STATISTIC
      WHERE METRICS = ? AND RECORD_DATE BETWEEN ? AND ?
    `;

    const queryParams = hospitalCodesArray
      ? [hospitalCodesArray, metrics, dateFrom, dateTo]
      : [metrics, dateFrom, dateTo];

    const [rows] = await db.query(query, queryParams);

    // Map the rows into an array of entities
    const stats = rows.map(row => ({
      recordId: row.RECORD_ID,       // Map RECORD_ID
      clusterCode: row.CLUSTER_CODE, // Map CLUSTER_CODE
      hospitalCode: row.HOSPITAL_CODE, // Map HOSPITAL_CODE
      metrics: row.METRICS,          // Map METRICS
      dataType: row.DATA_TYPE,       // Map DATA_TYPE
      value: row.VALUE,              // Map VALUE
      userRank: row.USER_RANK,              // Map USER_RANK
      userSpecialty: row.USER_SPECIALTY,              // Map USER_SPECIALTY
      episodeType: row.EPISODE_TYPE,              // Map EPISODE_TYPE 
      recordMonth: row.recordMonth,  // Map RECORD_DATE as month
      recordYear: row.recordYear     // Map RECORD_DATE as year
    }));

    return { statistic: stats };
  } catch (err) {
    console.error('Error querying database:', err);
    throw err;
  }
}

async function addStat(clusterCode, hospitalCode, metrics, dataType, value, userRank, userSpecialty, episodeType, recordYear, recordMonth) {
  try {
    const recordDate = `${recordYear}-${recordMonth}-01`; // Format date as 'YYYY-MM-DD'
    const recordId = uuidv4(); // Generate a unique ID for the record

    const query = `
          INSERT INTO STATISTIC 
          (RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, USER_RANK, USER_SPECIALTY, EPISODE_TYPE, RECORD_DATE, CREATE_DATETIME) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?, NOW())
      `;

    const [result] = await db.query(query, [
      recordId,
      clusterCode,
      hospitalCode,
      metrics,
      dataType,
      value,
      userRank,
      userSpecialty,
      episodeType,
      recordDate
    ]);

    return result;
  } catch (err) {
    console.error('Error inserting data:', err);
    throw err;
  }
}

async function delStat(metrics, recordYear, recordMonth) {
  try {
    const recordDate = `${recordYear}-${recordMonth}-01`; // Format date as 'YYYY-MM-DD'
    const recordId = uuidv4(); // Generate a unique ID for the record

    const query = `
          DELETE FROM STATISTIC 
          WHERE METRICS = ? AND RECORD_DATE = ?
      `;

    const [result] = await db.query(query, [metrics, recordDate]);

    return result;
  } catch (err) {
    console.error('Error inserting data:', err);
    throw err;
  }
}

function convertMonthToNumber(monthAbbreviation) {
  const months = {
    JAN: '01',
    FEB: '02',
    MAR: '03',
    APR: '04',
    MAY: '05',
    JUN: '06',
    JUL: '07',
    AUG: '08',
    SEP: '09',
    OCT: '10',
    NOV: '11',
    DEC: '12',
  };

  return months[monthAbbreviation.toUpperCase()] || null;
}

module.exports = { getStats, addStat, delStat };