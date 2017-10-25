const express = require('express');

const seriesRouter = express.Router({mergeParams: true});

const issuesRouter = require('./issues');
seriesRouter.use('/:id/issues', issuesRouter);

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

seriesRouter.put('/:id', (req, res, next) => {
  const seriesName = req.body.series.name;
  const seriesDescription = req.body.series.description;
  if (!seriesName || !seriesDescription) {
    res.status(400).send();
  } else {
    db.run('UPDATE Series SET name = $name, description = $description',
           {
             $name: seriesName,
             $description: seriesDescription
           }, function(err) {
              if (err) {
                next(err);
              } else {
                db.get(`SELECT * FROM Series WHERE id = ${req.params.id}`,
                  (error, row) => {
                    res.status(200).json({series: row});
                  });
              }
           }
         );
  }
});

seriesRouter.delete('/:id', (req, res, next) => {
  db.get('SELECT * FROM Issue where series_id = $id', { $id: req.params.id },
          (error, row) => {
            if (error) {
              next(error);
            } else if (row) {
              res.status(400).send();
            } else {
              db.run('DELETE FROM Series WHERE id = $id', { $id: req.params.id},
                      (error) => {
                        if (error) {
                          next(error);
                        } else {
                          res.status(204).send();
                        }
                    });
            }
          });
});
