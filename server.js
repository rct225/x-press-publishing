const express = require('express');
const app = express();

module.exports = app;

const PORT = process.env.PORT || 4001;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
