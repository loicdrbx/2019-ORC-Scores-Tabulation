/* this file contains all of the web API functions */
/* firebase auth related */
const firebase = require('firebase-admin');
const firebaseConfig = {
  apiKey: 'AIzaSyAE4eRBKFJ7rZ11eU-WWJp5VKA9S5JuJhA',
  authDomain: 'ieee-orc.firebaseapp.com',
  databaseURL: 'https://ieee-orc.firebaseio.com',
  projectId: 'ieee-orc',
  storageBucket: 'ieee-orc.appspot.com',
  messagingSenderId: '547825791862',
  appId: '1:547825791862:web:e47809a421a8153b'
};
firebase.initializeApp(firebaseConfig);

/* expressjs related */
const express = require('express');
const cookieParser = require('cookie-parser')();
const bodyParser = require('body-parser');
const cors = require('cors')({origin: ['http://c9.anjurik.ml']});
const app = express();

/* database related */
const Database = require('./db/database');
const Schema = require('./db/databaseSchema');
const DB_PATH = './db/data-ORC2019.db';
const DB_SCHEMA = Schema.DB_SCHEMA;
let DB = new Database(DB_PATH, DB_SCHEMA);

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }
  firebase.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    // Set the user for this
    req.user = decodedIdToken;
    return next();
  }).catch((error) => {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return;
  });
};

// Various middlewares used
app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(bodyParser.json());

// Simple hello method
app.get('/hello', (req, res) => {
  res.send(`Hello ${req.user.email}\n<pre>${JSON.stringify(req.user)}</pre>`);
});

// Sumo
app.post('/sumo', (req, res) => {
  // res.status(400).send('{"message":"Student already donated!"}');
  // 0 points = loss, 1 point = tie, 2 points = win
  const translations = ['loss', 'tie', 'win'];
  // Add the database entry for the 1st team
  DB.addSumoEntry(req.body.one.id, translations[req.body.one.points]);
  // Add the database entry for the 2nd team
  DB.addSumoEntry(req.body.two.id, translations[req.body.two.points]);
  // Reply back all ok
  res.status(200).send('{"message":"Results successfully recorded!"}');
});

// Drag race
app.post('/dragrace', (req, res) => {
  var oneResult, twoResult;
  if (req.body.one.pts > req.body.two.pts) {
    // Team one wins
    oneResult = 'win';
    twoResult = 'loss';
  } else if (req.body.one.pts < req.body.two.pts) {
    // Team two wins
    twoResult = 'win';
    oneResult = 'loss';
  } else if (req.body.one.pts == req.body.two.pts) {
    // Tie
    oneResult = 'tie';
    twoResult = 'tie';
  }
  // Add the database entry for the 1st team
  DB.addDragRaceEntry(req.body.one.id, oneResult);
  // Add the database entry for the 2nd team
  DB.addDragRaceEntry(req.body.two.id, twoResult);
  // Reply back all ok
  res.status(200).send('{"message":"Results successfully recorded!"}');
});

// Da vinci
app.post('/davinci', (req, res) => {
  // Add the database entry for the 1st team
  DB.addDaVinciEntry(req.body.one.id, req.body.one.pts);
  // Add the database entry for the 2nd team
  DB.addDaVinciEntry(req.body.two.id, req.body.two.pts);
  // Reply back all ok
  res.status(200).send('{"message":"Results successfully recorded!"}');
});

// LRT
app.post('/lrt', (req, res) => {
  // Add the database entry for the team
  DB.addLRTEntry(req.body.team.id, req.body.team.time);
  // Reply back all ok
  res.status(200).send('{"message":"Results successfully recorded!"}');
});

// Interview
app.post('/interview', (req, res) => {
  // Add the database entry for the team
  DB.addInterviewEntry(req.body.team.id, req.body.team.pts);
  // Reply back all ok
  res.status(200).send('{"message":"Results successfully recorded!"}');
});

// Calculate all
app.get('/calculate', (req, res) => {
  // Sumo
  DB.computeSumoResults();
  // Drag race
  DB.computeDragRaceResults();
  // Da vinci
  DB.computeDaVinciResults();
  // LRT
  DB.computeLRTResults();
  // Reply back all ok
  res.status(200).send('{"message":"Results successfully computed!"}');
});

// Listen
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`IEEE ORC database API listening on port ${port}!`));
