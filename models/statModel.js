const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

async function getStats(hospitalCode, metrics, dateFrom, dateTo) {
  try {
    const query = `
      SELECT RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, 
             MONTH(RECORD_DATE) AS recordMonth, YEAR(RECORD_DATE) AS recordYear
      FROM STATISTIC
      WHERE HOSPITAL_CODE = ? AND METRICS = ? AND RECORD_DATE BETWEEN ? AND ?
    `;

    const [rows] = await db.query(query, [hospitalCode, metrics, dateFrom, dateTo]);

    // Map the rows into an array of entities
    const stats = rows.map(row => ({
      recordId: row.RECORD_ID,       // Map RECORD_ID
      clusterCode: row.CLUSTER_CODE, // Map CLUSTER_CODE
      hospitalCode: row.HOSPITAL_CODE, // Map HOSPITAL_CODE
      metrics: row.METRICS,          // Map METRICS
      dataType: row.DATA_TYPE,       // Map DATA_TYPE
      value: row.VALUE,              // Map VALUE
      recordMonth: row.recordMonth,  // Map RECORD_DATE as month
      recordYear: row.recordYear     // Map RECORD_DATE as year
    }));

    return { statistic: stats };
  } catch (err) {
    console.error('Error querying database:', err);
    throw err;
  }
}

async function addStat(clusterCode, hospitalCode, metrics, dataType, value, recordYear, recordMonth) {
  try {
      const recordDate = `${recordYear}-${recordMonth}-01`; // Format date as 'YYYY-MM-DD'
      const recordId = uuidv4(); // Generate a unique ID for the record

      const query = `
          INSERT INTO STATISTIC 
          (RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, RECORD_DATE, NOW()) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(query, [
          recordId,
          clusterCode,
          hospitalCode,
          metrics,
          dataType,
          value,
          recordDate
      ]);

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

module.exports = { getStats, addStat };