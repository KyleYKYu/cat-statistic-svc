const oracledb = require('oracledb');
const dbConfig = require('../config/dbConfig');

async function getConnection() {
  return await oracledb.getConnection(dbConfig);
}

module.exports = { getConnection };