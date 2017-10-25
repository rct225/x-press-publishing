const express = require('express');

const issuesRouter = express.Router();

module.exports = issuesRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Issue WHERE series_id = $id', { $id: req.series.id },
        (err, rows) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({issues: rows});
          }
  });
});
