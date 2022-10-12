const Database = require('better-sqlite3');

module.exports = new Database('database/development.sqlite3');