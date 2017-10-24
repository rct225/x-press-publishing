const express = require('express');
const app = express();

module.exports = app;

const PORT = process.env.PORT || 4001;

const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');

app.use(bodyParser.json());
app.use(cors());

const apiRouter = require('./server/api');
app.use('/api', apiRouter);

app.use(errorhandler());

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});
