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

/** DRAG RACE CHALLENGE */
CREATE TABLE IF NOT EXISTS drag_challenge (
  teamNum INT PRIMARY KEY,
  matches INT DEFAULT 0 NOT NULL,
  wins INT DEFAULT 0 NOT NULL,
  ties INT DEFAULT 0 NOT NULL,
  losses INT DEFAULT 0 NOT NULL,
  points INT DEFAULT 0 NOT NULL,
  score  REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS drag_challenge_insertTrigger AFTER INSERT ON drag_challenge
  BEGIN
    /** Inefficient because the calculations are done for all rows,
    not just the one inserted. Not enough time to fix. */
    UPDATE drag_challenge SET matches = wins + ties + losses;
    UPDATE drag_challenge SET points = 2 * wins + ties;
    UPDATE drag_challenge SET score = 1.0 * points / (SELECT max(points) FROM drag_challenge) * 70;
  END;

CREATE TRIGGER IF NOT EXISTS drag_challenge_updateTrigger AFTER UPDATE ON drag_challenge
  BEGIN
    /** Inefficient because the calculations are done for all rows,
    not just the one inserted. Not enough time to fix. */
    UPDATE drag_challenge SET matches = wins + ties + losses;
    UPDATE drag_challenge SET points = 2 * wins + ties;
    UPDATE drag_challenge SET score = 1.0 * points / (SELECT max(points) FROM drag_challenge) * 70;
  END;

/** DRAG RACE RESULTS */
CREATE TABLE IF NOT EXISTS drag_results (
  teamNum INT PRIMARY KEY,
  challenge REAL DEFAULT 0.0 NOT NULL,
  interview REAL DEFAULT 0.0 NOT NULL,
  totalScore REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS drag_results_insertTrigger AFTER INSERT ON drag_results
  BEGIN
    UPDATE drag_results SET totalScore = challenge + interview;
  END;

  /** DA VINCI CHALLENGE */
  CREATE TABLE IF NOT EXISTS daVinci_challenge (
    teamNum INT PRIMARY KEY,
    totalPoints INT DEFAULT 0 NOT NULL,
    avgPoints REAL DEFAULT 0.0 NOT NULL,
    score REAL DEFAULT 0.0 NOT NULL
  );
  
  CREATE TRIGGER IF NOT EXISTS daVinci_challenge_insertTrigger AFTER INSERT ON daVinci_challenge
    BEGIN
      UPDATE daVinci_challenge SET avgPoints = totalPoints / 4.0 WHERE teamNum = NEW.teamNum;
      UPDATE daVinci_challenge SET score = 1.0 * avgPoints / (SELECT max(avgPoints) FROM daVinci_challenge) * 70.0;
    END;
  
  CREATE TRIGGER IF NOT EXISTS daVinci_challenge_updateTrigger AFTER UPDATE OF totalPoints ON daVinci_challenge
    BEGIN
      UPDATE daVinci_challenge SET avgPoints =  totalPoints / 4.0 WHERE teamNum = NEW.teamNum;
      UPDATE daVinci_challenge SET score = 1.0 * avgPoints / (SELECT max(avgPoints) FROM daVinci_challenge) * 70.0;
    END;
  
  /** DA VINCI RESULTS */
  CREATE TABLE IF NOT EXISTS daVinci_results (
    teamNum INT PRIMARY KEY,
    challenge REAL DEFAULT 0.0 NOT NULL,
    interview REAL DEFAULT 0.0 NOT NULL,
    totalScore REAL DEFAULT 0.0 NOT NULL
  );
  
  CREATE TRIGGER IF NOT EXISTS daVinci_results_insertTrigger AFTER INSERT ON daVinci_results
    BEGIN
      UPDATE daVinci_results SET totalScore = challenge + interview;
    END;

/** DA VINCI CHALLENGE */
CREATE TABLE IF NOT EXISTS daVinci_challenge (
  teamNum INT PRIMARY KEY,
  totalPoints INT DEFAULT 0 NOT NULL,
  avgPoints REAL DEFAULT 0.0 NOT NULL,
  score REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS daVinci_challenge_insertTrigger AFTER INSERT ON daVinci_challenge
  BEGIN
    UPDATE daVinci_challenge SET avgPoints = totalPoints / 4.0 WHERE teamNum = NEW.teamNum;
    UPDATE daVinci_challenge SET score = 1.0 * avgPoints / (SELECT max(avgPoints) FROM daVinci_challenge) * 70.0;
  END;

CREATE TRIGGER IF NOT EXISTS daVinci_challenge_updateTrigger AFTER UPDATE OF totalPoints ON daVinci_challenge
  BEGIN
    UPDATE daVinci_challenge SET avgPoints =  totalPoints / 4.0 WHERE teamNum = NEW.teamNum;
    UPDATE daVinci_challenge SET score = 1.0 * avgPoints / (SELECT max(avgPoints) FROM daVinci_challenge) * 70.0;
  END;

/** DA VINCI RESULTS */
CREATE TABLE IF NOT EXISTS daVinci_results (
  teamNum INT PRIMARY KEY,
  challenge REAL DEFAULT 0.0 NOT NULL,
  interview REAL DEFAULT 0.0 NOT NULL,
  totalScore REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS daVinci_results_insertTrigger AFTER INSERT ON daVinci_results
  BEGIN
    UPDATE daVinci_results SET totalScore = challenge + interview;
  END;

/** LRT CHALLENGE */
CREATE TABLE IF NOT EXISTS lrt_challenge (
  teamNum INT PRIMARY KEY,
  mazes INT DEFAULT 0 NOT NULL,
  totalTime REAL DEFAULT 0.0 NOT NULL,
  avgTime REAL DEFAULT 0.0 NOT NULL,
  score REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS lrt_challenge_insertTrigger AFTER INSERT ON lrt_challenge
  BEGIN
    UPDATE lrt_challenge SET mazes = mazes + 1 WHERE teamNum = NEW.teamNum;
    UPDATE lrt_challenge SET avgTime = 1.0 * totalTime / mazes  WHERE teamNum = NEW.teamNum;
    UPDATE lrt_challenge SET score = 1.0 * (SELECT min(avgTime) FROM lrt_challenge) / avgTime * 70.0;
  END;

CREATE TRIGGER IF NOT EXISTS lrt_challenge_updateTrigger AFTER UPDATE OF totalTime ON lrt_challenge
  BEGIN
    UPDATE lrt_challenge SET mazes = mazes + 1 WHERE teamNum = NEW.teamNum;
    UPDATE lrt_challenge SET avgTime = 1.0 * totalTime / mazes  WHERE teamNum = NEW.teamNum;
    UPDATE lrt_challenge SET score = 1.0 * (SELECT min(avgTime) FROM lrt_challenge) / avgTime * 70.0;
  END;

/** LRT  RESULTS */
CREATE TABLE IF NOT EXISTS lrt_results (
  teamNum INT PRIMARY KEY,
  challenge REAL DEFAULT 0.0 NOT NULL,
  interview REAL DEFAULT 0.0 NOT NULL,
  totalScore REAL DEFAULT 0.0 NOT NULL
);

CREATE TRIGGER IF NOT EXISTS lrt_results_insertTrigger AFTER INSERT ON lrt_results
  BEGIN
    UPDATE lrt_results SET totalScore = challenge + interview;
  END;
  
/** INTERVIEW */
CREATE TABLE IF NOT EXISTS interview_scores (
  teamNum INT PRIMARY KEY,
  score INT DEFAULT 0 NOT NULL
)
`