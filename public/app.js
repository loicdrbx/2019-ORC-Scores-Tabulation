const Database = require('../db/database');
const Schema = require('../db/databaseSchema');

const DB_PATH = '../db/data-ORC2019.db';
const DB_SCHEMA = Schema.DB_SCHEMA;

var DB = new Database(DB_PATH, DB_SCHEMA);

/**
 * WARNING - BEWARE
 * Most the database functions run asyschronously. This means that
 * your code will not be executed line by line, but rather race to complete.
 * (i.e the tenth line might finish executing before the first line.)
 * Either learn how to use javascript promises or run one command at a time.
 * 
 * ALSO - The test functions are just wrappers of the actual DB functions.
 * Feel free to get rid of them and make direct calls to the db.
 */

// Sumo Challenge test functions
// (Run only one at a time for best results)
// addSumoEntries();
getSumoEntries();
// clearSumoEntries();

// Interview test functions
// (run only one at a time for best results)
// addInterviewEntries();
// getInterviewEntries();
// clearInterviewEntries();

// Sumo Results test functions
// (run one at a time for best results)
// computeSumoResults();
// getSumoResults();
// clearSumoResults();

function clearSumoEntries() {
  DB.clearSumoEntries();
}

function addSumoEntries() {
  DB.addSumoEntry(84, 'win');
  DB.addSumoEntry(84, 'tie');
  DB.addSumoEntry(84, 'loss');
  DB.addSumoEntry(89, 'win');
  DB.addSumoEntry(89, 'win');
  DB.addSumoEntry(89, 'tie')
  DB.addSumoEntry(82, 'win')
  DB.addSumoEntry(78, 'loss');
  DB.addSumoEntry(78, 'loss');
}

function getSumoEntries() {
  DB.getSumoEntries();
}

function addInterviewEntries() {
  DB.addInterviewEntry(89, 15);
  DB.addInterviewEntry(84, 25);
  DB.addInterviewEntry(82, 20);
  DB.addInterviewEntry(78, 18);
  DB.addInterviewEntry(89, 30); 
}

function clearInterviewEntries() {
  DB.clearInterviewEntries();
}

function getInterviewEntries() {
  DB.getInterviewEntries();
}

function computeSumoResults() {
  DB.computeSumoResults();
}

function getSumoResults() {
  DB.getSumoResults();
}

function clearSumoResults() {
  DB.clearSumoResults();
}

