/**
 * @file: db connection boilerplate
 */

var pgpLib = require('pg-promise');
var conString = require('../../config/config.json').dbConnection;

var pg = pgpLib();

var database = pg(conString);

module.exports = database;