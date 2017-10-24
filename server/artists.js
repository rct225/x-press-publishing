const express = require('express');

const artistsRouter = express.Router();

module.exports = artistsRouter;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

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
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed == 1 ? 0 : 1;
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
