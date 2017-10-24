const express = require('express');
const app = express();

module.exports = app;

const PORT = process.env.PORT || 4001;

const apiRouter = require('./server/api');
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});
