const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middlewares/logger');
const authroute = require('./routes/auth');
const companyroute = require('./routes/company');
const storeroute = require('./routes/store');
const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'routes');


dotenv.config();

const app = express();

// ✅ Correct body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const routeName = file.replace('.js', '');
    const route = require(path.join(routesPath, file));
    app.use(`/${routeName}`, route);
  }
});

app.get('/', (req, res) => {
  res.send('API running...');
});

module.exports = app;
