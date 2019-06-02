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
        return console.error(err.message);
      }
      console.log('Connected to ' + DB_PATH + ' database.');
    });
    // Execute the database's schema or create it if it doesn't exist
    this.db.exec(DB_SCHEMA, function(err){
      if (err) {
        return console.error(err.message);
      }
      console.log('Database schema has been executed.');
    });
  }

  /**
   * Adds an entry to the sumo challenge table
   * @param {number} teamNum The team's number
   * @param {string} result  The team's result. Either win, tie or loss.
   * @param {function} callback  The function to call upon success or failure. First argument is success (boolean), second argument is description (string) when an error occurs
   */
  addSumoEntry(teamNum, result, callback) {
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
            // console.error(err.message);
            if (callback) callback(false, `Unable to insert data. Error: ${err.message}`);
          }
          // console.log('Team ' + teamNum + 's sumo result has been inserted.');
          if (callback) callback(true);
        });
        break;
      case 'tie':
        this.db.run(tieSQL, function(err) {
          if (err) {
            // console.error(err.message);
            if (callback) callback(false, `Unable to insert data. Error: ${err.message}`);
          }
          // console.log('Team ' + teamNum + 's sumo result has been inserted.');
          if (callback) callback(true);
        });
        break;
      case 'loss':
        this.db.run(lossSQL, function(err) {
          if (err) {
            // console.error(err.message);
            if (callback) callback(false, `Unable to insert data. Error: ${err.message}`);
          }
          // console.log('Team ' + teamNum + 's sumo result has been inserted.');
          if (callback) callback(true);
        });
        break;
      default:
        // return console.error("Failed to insert data. Team's result can be either win, tie, or loss.");
        if (callback) callback("Failed to insert data. Team's result can be either win, tie, or loss.");
    }
  }

  /**
   * Retrieves all the data in the sumo challenge table
   * @param {function} callback  The function to call upon success or failure. If error occurs, the first argument will be a string. If not, it will be an array.
   */
  getSumoEntries(callback) {
    // SQL query to be executed
    const SQL = `SELECT * FROM sumo_challenge ORDER BY score DESC, matches;`;
    // Return the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        // console.error(err.message);
        if (callback) callback(`Unable to retrieve data. Error: ${err.message}`);
      }
      if (callback) callback(rows);
      // Pretty print the results
      // console.log('Sumo Challenge Results');
      // console.log('Team # | Matches | Wins | Ties | Losses | Points | Score (out of 70)');
      // rows.forEach(function(row) {
      //   console.log(`${row.teamNum} | ${row.matches} | ${row.wins} | ${row.ties} | ${row.losses} | ${row.points} | ${row.score}`);
      // });
    });
  }

  /**
   * Clears all data in the sumo challenge table
   * @param {function} callback  The function to call upon success or failure. First argument is success (boolean), second argument is description (string) when an error occurs
   */
  clearSumoEntries(callback) {
    this.db.run(`DELETE FROM sumo_challenge;`, function(err) {
      if (err) {
        // console.error(err.message);
        if (callback) callback(false, `Unable to delete data. Error: ${err.message}`);
      }
      console.log('sumo_challenge table has been cleared.');
      if (callback) callback(true);
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
   * Adds an entry to the drag race challenge table
   * @param {number} teamNum The team's number
   * @param {string} result  The team's result. Either win, tie or loss.
   */
  addDragRaceEntry(teamNum, result) {
    // SQL statements to insert or update (upsert) results into database
    const winSQL = `INSERT INTO drag_challenge (teamNum, wins, ties, losses)
                      VALUES (${teamNum}, 1, 0, 0)
                      ON CONFLICT(teamNum) DO
                        UPDATE SET wins = wins + 1 WHERE teamNum = ${teamNum};`
    const tieSQL = `INSERT INTO drag_challenge (teamNum, wins, ties, losses)
                      VALUES (${teamNum}, 0, 1, 0)
                      ON CONFLICT(teamNum) DO
                        UPDATE SET ties = ties + 1 WHERE teamNum = ${teamNum};`
    const lossSQL = `INSERT INTO drag_challenge (teamNum, wins, ties, losses)
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
          console.log('Team ' + teamNum + 's drag race result has been inserted.');
        });
        break;
      case 'tie':
        this.db.run(tieSQL, function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('Team ' + teamNum + 's drag race result has been inserted.');
        });
        break;
      case 'loss':
        this.db.run(lossSQL, function(err) {
          if (err) {
            return console.error(err.message);
          }
          console.log('Team ' + teamNum + 's drag race result has been inserted.');
        });
        break;
      default:
        return console.error("Invalid result string. Failed to insert data. Try again, dummy.");
    }
  }

  /**
   * Retrieves all the data in the drag race challenge table
   */
  getDragRaceEntries() {
    // SQL query to be executed
    const SQL = `SELECT * FROM drag_challenge ORDER BY score DESC, matches;`;
    // Return the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(error.message);
      }
      // Pretty print the results
      console.log('Drag Race Challenge Results');
      console.log('Team # | Matches | Wins | Ties | Losses | Points | Score (out of 70)');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.matches} | ${row.wins} | ${row.ties} | ${row.losses} | ${row.points} | ${row.score}`);
      });
    });
  }

  /**
   * Computes final results for the Drag Race Challenge (interview + challenge).
   * Should only be run when all interviews have been completed.
   */
  computeDragRaceResults() {
    // SQL to be executed
    const SQL = `INSERT OR REPLACE INTO drag_results (teamNum, challenge, interview)
                  SELECT drag_challenge.teamNum, drag_challenge.score, interview_scores.score
                    FROM drag_challenge, interview_scores
                    WHERE drag_challenge.teamNum = interview_scores.teamNum;`
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Drag Race final results have been computed!');
    });
  }
  
  /**
   * Retrieves all the data in the drag_results table
   */
  getDragRaceResults() {
    // SQL query to be executed
    const SQL = `SELECT * FROM drag_results ORDER BY totalScore DESC;`;
    // Retun the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(err.message);
      }
      // Pretty print the results
      console.log('Drag Race Final Results');
      console.log('Team # | Challenge | Interview | Total Score');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.challenge} | ${row.interview} | ${row.totalScore}`);
      });
    });
  }

  /**
   * Clears all data in the drag race challenge table
   */
  clearDragRaceEntries() {
    this.db.run(`DELETE FROM drag_challenge;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('drag_challenge table has been cleared.');
    });
  }

  /** Clears all data in the drag race results table */
  clearDragRaceResults() {
    this.db.run(`DELETE FROM drag_results;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('drag_results table has been cleared.');
    });
  }

  /**
   * Adds an entry to da vinci challenge table
   * @param {number} teamNum The team's number
   * @param {number} points The team's points (out of 10)
   */
  addDaVinciEntry(teamNum, points) {
    // SQL to be executed
    const SQL = `INSERT INTO daVinci_challenge (teamNum, totalPoints)
                  VALUES (${teamNum}, ${points})
                    ON CONFLICT(teamNum) DO
                    UPDATE SET totalPoints = totalPoints + ${points} WHERE teamNum = ${teamNum};`;
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Team ' + teamNum + 's da Vinci score has been inserted.');
    });
  }

  /**
   * Retrieves all the data in the da vinci race challenge table
   */
  getDaVinciEntries() {
    // SQL query to be executed
    const SQL = `SELECT * FROM daVinci_challenge ORDER BY score DESC;`;
    // Return the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(error.message);
      }
      // Pretty print the results
      console.log('Da Vinci Challenge Results');
      console.log('Team # | Total Points | Avg. Points | Score (out of 70)');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.totalPoints} | ${row.avgPoints} | ${row.score}`);
      });
    });
  }

  /**
   * Clears all data in the da vinci challenge table
   */
  clearDaVinciEntries() {
    this.db.run(`DELETE FROM daVinci_challenge;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('daVinci_challenge table has been cleared.');
    });
  }

  /**
   * Computes final results for the Da Vinci Challenge (interview + challenge).
   * Should only be run when all interviews have been completed.
   */
  computeDaVinciResults() {
    // SQL to be executed
    const SQL = `INSERT OR REPLACE INTO daVinci_results (teamNum, challenge, interview)
                  SELECT daVinci_challenge.teamNum, daVinci_challenge.score, interview_scores.score
                    FROM daVinci_challenge, interview_scores
                    WHERE daVinci_challenge.teamNum = interview_scores.teamNum;`;
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Da Vinci final results have been computed!');
    });
  }
  
  /**
   * Retrieves all the data in the daVinci_results table
   */
  getDaVinciResults() {
    // SQL query to be executed
    const SQL = `SELECT * FROM daVinci_results ORDER BY totalScore DESC;`;
    // Retun the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(err.message);
      }
      // Pretty print the results
      console.log('Da Vinci Final Results');
      console.log('Team # | Challenge | Interview | Total Score');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.challenge} | ${row.interview} | ${row.totalScore}`);
      });
    });
  }

  /** Clears all data in the drag race results table */
  clearDaVinciResults() {
    this.db.run(`DELETE FROM daVinci_results;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('daVinci_results table has been cleared.');
    });
  }

  /**
   * Adds an entry to the interview scores table
   * @param {number} teamNum The team's number
   * @param {number} score The team's score (out of 30)
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
   * Adds an entry to the lrt challenge table
   * @param {number} teamNum The team's number
   * @param {number} time The team's time (max 120 seconds)
   */
  addLRTEntry(teamNum, time) {
    // SQL to be executed
    const SQL = `INSERT INTO lrt_challenge (teamNum, totalTime)
                  VALUES (${teamNum}, ${time})
                  ON CONFLICT(teamNum) DO
                    UPDATE SET totalTime = totalTime + ${time} WHERE teamNum = ${teamNum};`;
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('Team ' + teamNum + 's LRT score has been inserted.');
    });
  }

  /**
   * Retrieves all the data in the lrt challenge table
   */
  getLRTEntries() {
    // SQL query to be executed
    const SQL = `SELECT * FROM lrt_challenge ORDER BY mazes DESC, score DESC;`;
    // Return the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(error.message);
      }
      // Pretty print the results
      console.log('LRT Challenge Results');
      console.log('Team # | # Mazes | Total Time | Avg. Time | Score (out of 70)');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.mazes} | ${row.totalTime} | ${row.avgTime} | ${row.score}`);
      });
    });
  }

  /**
   * Clears all data in the lrt challenge table
   */
  clearLRTEntries() {
    this.db.run(`DELETE FROM lrt_challenge;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('lrt_challenge table has been cleared.');
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
   * Computes final results for the LRT Challenge (interview + challenge).
   * Should only be run when all interviews have been completed.
   */
  computeLRTResults() {
    // SQL to be executed
    const SQL = `INSERT OR REPLACE INTO lrt_results (teamNum, challenge, interview)
                  SELECT lrt_challenge.teamNum, lrt_challenge.score, interview_scores.score
                    FROM lrt_challenge, interview_scores
                    WHERE lrt_challenge.teamNum = interview_scores.teamNum;`;
    // Run the SQL
    this.db.run(SQL, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('LRT final results have been computed!');
    });
  }
  
  /**
   * Retrieves all the data in the lrt_results table
   */
  getLRTResults() {
    // SQL query to be executed
    const SQL = `SELECT * FROM lrt_results ORDER BY totalScore DESC;`;
    // Retun the results of the query one row at a time
    this.db.all(SQL, function(err, rows) {
      if (err) {
        return console.error(err.message);
      }
      // Pretty print the results
      console.log('LRT Final Results');
      console.log('Team # | Challenge | Interview | Total Score');
      rows.forEach(function(row) {
        console.log(`${row.teamNum} | ${row.challenge} | ${row.interview} | ${row.totalScore}`);
      });
    });
  }

  /** Clears all data in the LRT results table */
  clearLRTResults() {
    this.db.run(`DELETE FROM lrt_results;`, function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log('lrt_results table has been cleared.');
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
