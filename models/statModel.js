const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

async function getAllStat() {
  const connection = await db.getConnection();
  try {
    await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = CAT_USER`);
    const result = await connection.execute(`SELECT RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE FROM CAT_STATISTIC`);

    // Map the rows into an array of entities
    const stats = result.rows.map(row => ({
      recordId: row[0],       // Map RECORD_ID
      clusterCode: row[1],    // Map CLUSTER_CODE
      hospitalCode: row[2],   // Map HOSPITAL_CODE
      metrics: row[3],        // Map METRICS
      dataType: row[4],       // Map DATA_TYPE
      value: row[5],          // Map VALUE
    }));

    return stats;
  } finally {
    await connection.close();
  }
}

async function getStats(HOSPITAL_CODE, METRICS, DATE_FROM, DATE_TO) {
  const connection = await db.getConnection();
  try {
    await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = CAT_USER`);
    const result = await connection.execute(`SELECT RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, TO_CHAR(RECORD_DATE, 'MON'), TO_CHAR(RECORD_DATE, 'YYYY') FROM CAT_STATISTIC WHERE HOSPITAL_CODE = :hospitalCode AND METRICS = :metrics AND RECORD_DATE BETWEEN TO_DATE(:dateFrom, 'YYYY-MM-DD') AND TO_DATE(:dateTo, 'YYYY-MM-DD')`,
      { hospitalCode: HOSPITAL_CODE, metrics: METRICS, dateFrom: DATE_FROM, dateTo: DATE_TO }
    );

    // Map the rows into an array of entities
    const stats = result.rows.map(row => ({
      recordId: row[0],       // Map RECORD_ID
      clusterCode: row[1],    // Map CLUSTER_CODE
      hospitalCode: row[2],   // Map HOSPITAL_CODE
      metrics: row[3],        // Map METRICS
      dataType: row[4],       // Map DATA_TYPE
      value: row[5],          // Map VALUE
      recordMonth: row[6],          // Map RECORD_DATE as month
      recordYear: row[7],          // Map RECORD_DATE as month
    }));

    return {"statistic": stats};
  } finally {
    await connection.close();
  }
}

async function addStat(clusterCode, hospitalCode, metrics, dataType, value, recordYear, recordMonth) {
  try {
      const recordDate = `${recordYear}-${String(recordMonth).padStart(2, '0')}-01`; // Format date as 'YYYY-MM-DD'
      const recordId = uuidv4(); // Generate a unique ID for the record

      const query = `
          INSERT INTO CAT_STATISTIC 
          (RECORD_ID, CLUSTER_CODE, HOSPITAL_CODE, METRICS, DATA_TYPE, VALUE, RECORD_DATE) 
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

module.exports = { getAllStat, getStats, addStat };