const Database = require('../db/database');
const Schema = require('../db/databaseSchema');

const DB_PATH = '../db/data-ORC2019.db';
const DB_SCHEMA = Schema.DB_SCHEMA;

var DB = new Database(DB_PATH, DB_SCHEMA);

// Database API, for now
// DB.clearSumoEntries();
// DB.addSumoEntry(85, 'tie');
// DB.getSumoEntries();
 DB.computeSumoResults();
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
//  DB.computeDaVinciResults();
// DB.getDaVinciResults();
// DB.clearDaVinciEntries();

// DB.clearLRTEntries();
// DB.addLRTEntry(84, 9);
// DB.getLRTEntries();
// DB.computeLRTResults();
// DB.getLRTResults();
// DB.clearLRTResults();

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

function addChallengeEntries() {

  DB.addDaVinciEntry(55, 10);
  DB.addDaVinciEntry(55, 5);
  DB.addDaVinciEntry(55, 10);
  DB.addDaVinciEntry(55, 5);

  DB.addDaVinciEntry(84, 9);
  DB.addDaVinciEntry(84, 9);
  DB.addDaVinciEntry(84, 9);
  DB.addDaVinciEntry(84, 9);
}

function addInterviewEntries() {
  DB.addInterviewEntry(55, 30);
  DB.addInterviewEntry(84, 15);
}

function computeDaVinciResults() {
  DB.computeDaVinciResults();
}

function getChallengeEntries() {
  DB.getDaVinciEntries();
}

function getInterviewEntries() {
  DB.getInterviewEntries();
}

function getDaVinciResults() {
  DB.getDaVinciResults();
}