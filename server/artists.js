const express = require('express');

const artistsRouter = express.Router();

module.exports = artistsRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('id', (req, res, next, id) => {
  //const artistId = req.params.id;
  db.get('SELECT * FROM Artist where id=$id', { $id: id }, (error, row) => {
    if (row) {
      req.artist = row;
      next();
    } else {
      res.status(404).send();
    }
  });
});

artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({artists: rows});
    }
  });
});

artistsRouter.post('/', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography ) {
    res.status(400).send();
  } else {
    db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)' +
           ' VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)', {
             $name: name,
             $dateOfBirth: dateOfBirth,
             $biography: biography,
             $isCurrentlyEmployed: isCurrentlyEmployed
           }, function(err) {
             if (err) {
               next(err);
             } else {
               db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
                 (error, row) => {
                   res.status(201).json({artist: row});
                 });
               }
           });
  }
});

artistsRouter.get('/:id', (req, res, next) => {
  res.status(200).json({artist: req.artist});
});

artistsRouter.put('/:id', (req, res, next) => {
  const newArtist = req.body.artist;
  const name = newArtist.name;
  const dateOfBirth = newArtist.dateOfBirth;
  const biography = newArtist.biography;
  let isCurrentlyEmployed = newArtist.isCurrentlyEmployed;
  if (!name || !dateOfBirth || !biography ) {
    res.status(400).send();
  } else {
    db.run('UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, ' +
           'biography = $biography, is_currently_employed = $isCurrentlyEmployed ' +
           'WHERE id = $id', {
             $name: name,
             $dateOfBirth: dateOfBirth,
             $biography: biography,
             $isCurrentlyEmployed: isCurrentlyEmployed,
             $id: req.params.id
           }, function(err) {
             if (err) {
               next(err);
             } else {
               db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.id}`,
                 (error, row) => {
                   res.status(200).json({artist: row});
                 });
               }
           });
  }
});

artistsRouter.delete('/:id', (req, res, next) => {
  db.run('UPDATE Artist SET is_currently_employed = 0 WHERE id = $id',
          { $id: req.params.id }, err => {
              if (err) {
                next(err);
              } else {
                db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.id}`,
                  (error, row) => {
                    res.status(200).json({artist: row});
                  });
              }
          });
});
