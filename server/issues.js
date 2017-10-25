const express = require('express');

const issuesRouter = express.Router();

module.exports = issuesRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, id) => {
  db.get('SELECT * FROM Issue where id=$id', { $id: id }, (error, row) => {
    if (row) {
      req.issueId = row.id;
      next();
    } else {
      res.status(404).send();
    }
  });
});

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

issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const seriesId = req.series.id;

  db.get('SELECT * FROM Artist where id=$id', { $id: artistId }, (error, row) => {
    if (!row) {
      return res.status(400).send();
    }
  });

  db.get('SELECT * FROM Series where id=$id', { $id: seriesId }, (error, row) => {
    if (!row) {
      return res.status(400).send();
    }
  });

  if  (!name || !issueNumber || !publicationDate) {
    return res.status(400).send();
  }

  db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) ' +
         'VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)',
         {
           $name: name,
           $issueNumber: issueNumber,
           $publicationDate: publicationDate,
           $artistId: artistId,
           $seriesId: seriesId
         },
         function (error) {
           if (error) {
             next(error);
           } else {
             db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
               (error, row) => {
                 res.status(201).json({issue: row});
               });
             }
           }
  );
});

issuesRouter.put('/:issueId', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;
  const seriesId = req.series.id;

  db.get('SELECT * FROM Artist where id=$id', { $id: artistId }, (error, row) => {
    if (!row) {
      return res.status(400).send();
    }
  });

  if  (!name || !issueNumber || !publicationDate) {
    return res.status(400).send();
  }

  db.run('UPDATE Issue SET name = $name, issue_number = $issueNumber, ' +
         'publication_date = $publicationDate, artist_id = $artistId, ' +
         'series_id = $seriesId WHERE id = $id',
         {
           $name: name,
           $issueNumber: issueNumber,
           $publicationDate: publicationDate,
           $artistId: artistId,
           $seriesId: seriesId,
           $id: req.issueId
         },
         (err) => {
           if (err) {
             next(err);
           } else {
             db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.issueId}`,
               (error, row) => {
                 res.status(200



                 ).json({issue: row});
               });
           }
         }
        );


});

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run('DELETE FROM Issue WHERE id = $id', { $id: req.issueId},
        (err) => {
          if (err) {
            next(err);
          } else {
            res.status(204).send();
          }
        });
});
