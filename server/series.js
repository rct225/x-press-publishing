const express = require('express');

const seriesRouter = express.Router();

module.exports = seriesRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('id', (req, res, next, id) => {
  db.get('SELECT * FROM Series where id=$id', { $id: id }, (error, row) => {
    if (row) {
      req.series = row;
      next();
    } else {
      res.status(404).send();
    }
  });
});

seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({series: rows});
    }
  });
});

seriesRouter.post('/', (req, res, next) => {
  const seriesName = req.body.series.name;
  const seriesDescription = req.body.series.description;
  if (!seriesName || !seriesDescription) {
    res.status(400).send();
  } else {
    db.run('INSERT INTO Series (name, description) ' +
    'values($name, $description)', {
      $name: seriesName,
      $description: seriesDescription
    }, function(err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`,
          (error, row) => {
            res.status(201).json({series: row});
          });
      }
    });
  }
});

seriesRouter.get('/:id', (req, res, next) => {
  res.status(200).json({series: req.series});
});
