const sqlite3 = require('sqlite3').verbose();

class Database {

  /**
   * Connects to (and creates, if need be) a sqlite3 database
   * @param {string} DB_PATH The path to the database file
   * @param {string} DB_SCHEMA The database's schema (tables, data model...)
   */
  constructor(DB_PATH, DB_SCHEMA) {
    // Establish a connection with the database at DB_PATH
    this.db = new sqlite3.Database(DB_PATH, function(err){
      if (err) {
        return console.err(err.message);
      }
      console.log('Connected to ' + DB_PATH + ' database.');
    });
    // Create the database's schema if it doesn't exist
    this.db.exec(DB_SCHEMA, function(err){
      if (err) {
        return console.error(err.message);
      }
      console.log('Database schema has been created (if needed).');
    });
  }

  /**
   * Adds an entry to the sumo challenge table
   * @param {number} teamNum The team's number
   * @param {string} result  The team's result. Either win, tie or loss.
   */
  addSumoEntry(teamNum, result) {
    // SQL statements to insert or update (upsert) results into database
    const winSQL = `INSERT INTO sumo_challenge (teamNum, wins, ties, losses) 
                      VALUES (${teamNum}, 1, 0, 0)
                      ON CONFLICT(teamNum) DO 
                        UPDATE SET wins = wins + 1 WHERE teamNum = ${teamNum};`
    const tieSQL = `INSERT INTO sumo_challenge (teamNum, wins, ties, losses) 
                      VALUES (${teamNum}, 0, 1, 0)
                      ON CONFLICT(teamNum) DO 
                        UPDATE SET ties = ties + 1 WHERE teamNum = ${teamNum};`
    const lossSQL = `INSERT INTO sumo_challenge (teamNum, wins, ties, losses) 
                      VALUES (${teamNum}, 0, 0, 1)
                      ON CONFLICT(teamNum) DO 
                        UPDATE SET losses = losses + 1 WHERE teamNum = ${teamNum};`
    // Run appropriate SQL command depending on result              
    switch(result) {
      case 'win':
        this.db.run(winSQL, function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('Team ' + teamNum + 's sumo result has been inserted.' );
        });
        break;
      case 'tie':
        this.db.run(tieSQL, function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('Team ' + teamNum + 's sumo result has been inserted.' );
        });
        break;
      case 'loss':
        this.db.run(lossSQL, function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('Team ' + teamNum + 's sumo result has been inserted.' );
        });
        break;
      default:
        return console.error("Invalid result string. Failed to insert data. Try again, dummy.");
    }
  }

  /**
   * Retrieves all the data in the sumo challenge table
   */
  getSumoEntries() {
    // SQL query to be executed
    const SQL = `SELECT * FROM sumo_challenge ORDER BY score DESC, matches DESC;`;
    // Return the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(error.message);
      }
      // Pretty print the results
      console.log('Sumo Challenge Results');
      console.log('Team # | Matches | Wins | Ties | Losses | Points | Score (out of 70)');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.matches} | ${row.wins} | ${row.ties} | ${row.losses} | ${row.points} | ${row.score}`);
      });
    });
  }

  /**
   * Clears all data in the sumo challenge table
   */
  clearSumoEntries() {
    this.db.run(`DELETE FROM sumo_challenge;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('sumo_challenge table has been cleared.');
    });
  }

  /**
   * Computes final results for the Sumo Challenge (interview + challenge).
   * Should only be run when all interviews have been completed. 
   */
  computeSumoResults() {
    // SQL to be executed
    const SQL = `INSERT OR REPLACE INTO sumo_results (teamNum, challenge, interview)
                  SELECT sumo_challenge.teamNum, sumo_challenge.score, interview_scores.score
                    FROM sumo_challenge, interview_scores
                    WHERE sumo_challenge.teamNum = interview_scores.teamNum;`
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Sumo final results have been computed!');
    });
  }
  
  /**
   * Retrieves all the data in the sumo_results table
   */
  getSumoResults() {
    // SQL query to be executed
    const SQL = `SELECT * FROM sumo_results ORDER BY totalScore DESC;`;
    // Retun the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(err.message);
      }
      // Pretty print the results
      console.log('Sumo Final Results');
      console.log('Team # | Challenge | Interview | Total Score');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.challenge} | ${row.interview} | ${row.totalScore}`);
      });
    });
  }

  /** Clears all data in the sumo results table */
  clearSumoResults() {
    this.db.run(`DELETE FROM sumo_results;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('sumo_results table has been cleared.');
    });   
  }

  /**
   * Adds an entry to the interview scores table
   * @param {number} teamNum 
   * @param {number} score 
   */
  addInterviewEntry(teamNum, score) {
    // SQL to be executed
    const SQL = `INSERT OR REPLACE INTO interview_scores VALUES (${teamNum},${score});`
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Team ' + teamNum + 's interview score has been inserted.');
    });
  }

  /**
   * Retrieves all the data in the inverview scores table
   */
  getInterviewEntries() {
    // SQL query to be executed
    const SQL = `SELECT * FROM interview_scores ORDER BY teamNum DESC;`;
    // Return the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(error.message);
      }
      // Pretty print the results
      console.log('Interview Scores');
      console.log('Team # | Score (out of 30)');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.score}`);
      });
    });    
  }

 /**
   * Clears all data from the interview scores table
   */
  clearInterviewEntries() {
    this.db.run(`DELETE FROM interview_scores;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('interview_scores table has been cleared.');
    });
  }

  /**
   * Closes the connection to the database
   * (Never needs to be called, for now)
   */ 
  close() {
    this.db.close(function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connection to database closed.');
    });
  }
}

module.exports = Database;