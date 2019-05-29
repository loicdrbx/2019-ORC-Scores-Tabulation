module.exports.DB_SCHEMA = 
`
/** SUMO CHALLENGE */
CREATE TABLE IF NOT EXISTS sumo_challenge (
  teamNum INT PRIMARY KEY,
  matches INT DEFAULT 0 NOT NULL,
  wins INT DEFAULT 0 NOT NULL,
  ties INT DEFAULT 0 NOT NULL,
  losses INT DEFAULT 0 NOT NULL,
  points INT DEFAULT 0 NOT NULL,
  score  REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS sumo_challenge_insertTrigger AFTER INSERT ON sumo_challenge
  BEGIN
    /** Inefficient because the calculations are done for all rows,
    not just the one inserted. Not enough time to fix. */
    UPDATE sumo_challenge SET matches = wins + ties + losses;
    UPDATE sumo_challenge SET points = 2 * wins + ties;
    UPDATE sumo_challenge SET score = 1.0 * points / (SELECT max(points) FROM sumo_challenge) * 70;
  END;

CREATE TRIGGER IF NOT EXISTS sumo_challenge_updateTrigger AFTER UPDATE ON sumo_challenge
  BEGIN
    /** Inefficient because the calculations are done for all rows,
    not just the one inserted. Not enough time to fix. */
    UPDATE sumo_challenge SET matches = wins + ties + losses;
    UPDATE sumo_challenge SET points = 2 * wins + ties;
    UPDATE sumo_challenge SET score = 1.0 * points / (SELECT max(points) FROM sumo_challenge) * 70;
  END;

/** SUMO RESULTS */
CREATE TABLE IF NOT EXISTS sumo_results (
  teamNum INT PRIMARY KEY,
  challenge REAL DEFAULT 0.0 NOT NULL,
  interview REAL DEFAULT 0.0 NOT NULL,
  totalScore REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS sumo_results_insertTrigger AFTER INSERT ON sumo_results
  BEGIN
    UPDATE sumo_results SET totalScore = challenge + interview;
  END; 

/** INTERVIEW */
CREATE TABLE IF NOT EXISTS interview_scores (
  teamNum INT PRIMARY KEY,
  score INT DEFAULT 0 NOT NULL
)
`