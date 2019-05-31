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

// Database API, for now
// DB.clearSumoEntries();
// DB.addSumoEntry(84, 'win');
// DB.getSumoEntries();
// DB.computeSumoResults();
// DB.getSumoResults();
// DB.clearSumoResults();

// DB.clearDragRaceEntries();
// DB.addDragRaceEntry(84, 'win');
// DB.getDragRaceEntries();
// DB.computeDragRaceResults();
// DB.getDragRaceResults();
// DB.clearDragRaceResults();

// DB.clearDaVinciEntries();
// DB.addDaVinciEntry(84, 9);
// DB.getDaVinciEntries();
// DB.computeDaVinciResults();
// DB.getDaVinciResults();
// DB.clearDaVinciEntries();

// DB.addInterviewEntry(89, 15);
// DB.clearInterviewEntries();
// DB.getInterviewEntries();

// Challenge test functions
// (Run only one at a time for best results)
// addChallengeEntries();
// clearChallengeEntries();
// getChallengeEntries();

// Interview test functions
// (run only one at a time for best results)
//  addInterviewEntries();
// getInterviewEntries();
// clearInterviewEntries();

// Challenge Results test functions
// (run one at a time for best results)
// computeChallengeResults();
  getChallengeResults();
// clearChallengeResults();

function clearChallengeEntries() {
  DB.clearDaVinciEntries();
}

function addChallengeEntries() {
  // DB.addDaVinciEntry(84, 5.0);
  // DB.addDaVinciEntry(84, 5.0);
  // DB.addDaVinciEntry(84, 5.0);
  DB.addDaVinciEntry(84, 5.0);
  DB.addDaVinciEntry(89, 7.0);
  DB.addDaVinciEntry(89, 7.0);
  DB.addDaVinciEntry(89, 7.0);
  // DB.addDaVinciEntry(89, 7.0);
  // DB.addDaVinciEntry(73, 2);
  // DB.addDaVinciEntry(73, 2);
  // DB.addDaVinciEntry(73, 2);
  // DB.addDaVinciEntry(73, 2);
}


function getChallengeEntries() {
  DB.getDaVinciEntries();
}

function addInterviewEntries() {
  DB.addInterviewEntry(89, 15);
  DB.addInterviewEntry(84, 25);
  DB.addInterviewEntry(73, 20);
  DB.addInterviewEntry(78, 18);
  DB.addInterviewEntry(89, 30); 
}

function clearInterviewEntries() {
  DB.clearInterviewEntries();
}

function getInterviewEntries() {
  DB.getInterviewEntries();
}

function computeChallengeResults() {
  DB.computeDaVinciResults();
}

function getChallengeResults() {
  DB.getDaVinciResults();
}

function clearChallengeResults() {
  DB.clearDaVinciEntries();
}