const statModel = require('../models/statModel');

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

module.exports = { getStats, getAllStats, addStat };