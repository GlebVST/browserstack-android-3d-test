/* eslint-disable no-console */
const path = require('path');
const express = require('express');
const logger = require('./logger');
const port = require('./port');
const morgan = require('morgan');

const app = express();

const staticPath = path.join(__dirname, '..', 'static');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', staticPath);

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

app.use(morgan('combined'));

app.use(express.static(staticPath));

app.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  logger.appStarted(port, prettyHost);
});
