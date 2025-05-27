const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api', routes);

// Error Handling Middleware
//app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});