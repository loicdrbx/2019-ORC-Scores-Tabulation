/* global firebase, Vue, orc */
'use strict';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAE4eRBKFJ7rZ11eU-WWJp5VKA9S5JuJhA',
  authDomain: 'ieee-orc.firebaseapp.com',
  databaseURL: 'https://ieee-orc.firebaseio.com',
  projectId: 'ieee-orc',
  storageBucket: 'ieee-orc.appspot.com',
  messagingSenderId: '547825791862',
  appId: '1:547825791862:web:e47809a421a8153b'
};

// API config
const API_BACKEND = 'http://c9.anjurik.ml:3000';

// Initializes the IEEE ORC app.
function IEEEORC() {
  document.addEventListener('DOMContentLoaded', function() {
    // Shortcuts to DOM Elements.
    this.signInButton = document.getElementById('btn-sign-in');
    this.signOutButton = document.getElementById('btn-sign-out');
    this.recalculateButton = document.getElementById('btn-recalculate');
    this.styleContainer = document.getElementById('dyn-signin');
    this.userNameContainer = document.getElementById('user-name');

    // Initialize the Firebase app.
    firebase.initializeApp(firebaseConfig);

    // Bind events.
    this.signInButton.addEventListener('click', this.signIn.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.recalculateButton.addEventListener('click', this.recalculateScores.bind(this));
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
    this.signedInUser = null;

    // Setup Vue apps for each competition

    // Sumo
    this.sumoApp = new Vue({
      el: '#sumo',
      data: {
        one: {
          // Team one's ID, score, and points won
          id: 0,
          score: 0,
          points: 0
        },
        two: {
          // Team two's ID, score, and points won
          id: 0,
          score: 0,
          points: 0
        },
        // This is a mutex used to prevent sending multiple requests to the server storing the same info
        mutex: false
      },
      methods: {
        // This method calculates the point values for each team.
        calculatePoints: function() {
          if (this.one.score == this.two.score) {
            // Tie
            this.one.points = this.two.points = 1;
          } else if (this.one.score > this.two.score) {
            // Team one wins
            this.one.points = 2;
            this.two.points = 0;
          } else if (this.one.score < this.two.score) {
            // Team two wins
            this.one.points = 0;
            this.two.points = 2;
          }
        },
        // This method submits the data to the remote database server
        submitData: function() {
          if (this.mutex) return;
          this.mutex = true;

          // Validate the data
          if (this.one.id == this.two.id) {
            // Invalid team ID
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar({message: 'Team ID\'s cannot be the same!'});
            this.mutex = false;
            return;
          }
          this.calculatePoints();

          orc.sendAuthenticatedRequest('POST', API_BACKEND + '/sumo', {one: this.one, two: this.two}, (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              // Clear the table
              this.one.id = 0; this.one.score = 0; this.one.points = 0;
              this.two.id = 0; this.two.score = 0; this.two.points = 0;
            }
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            this.mutex = false;
          }, this);
        }
      }
    });

    // Drag race
    this.dragApp = new Vue({
      el: '#dragrace',
      data: {
        one: {
          id: 0,
          time: 0,
          stop: false,
          ltrack: false,
          llane: false,
          fstart: false,
          mstart: false,
          interference: false
        },
        onePts: 0,
        two: {
          id: 0,
          time: 0,
          stop: false,
          ltrack: false,
          llane: false,
          fstart: false,
          mstart: false,
          interference: false
        },
        twoPts: 0,
        mutex: false
      },
      methods: {
        calculatePoints: function() {
          // Reset points
          this.onePts = 0;
          this.twoPts = 0;

          // First the checks for time
          if (this.one.time > 0) {
            if (this.one.time <= this.two.time || this.two.time == 0) {
              // Team 1 beat Team 2 or tie
              this.onePts += 4;
            } else {
              // Second place
              this.onePts += 3;
            }
          }

          if (this.two.time > 0) {
            if (this.two.time <= this.one.time || this.one.time == 0) {
              // Team 2 beat Team 1 or tie
              this.twoPts += 4;
            } else {
              // Second place
              this.twoPts += 3;
            }
          }

          // Penalty/bonus calculations for team 1
          if (this.one.stop)   this.onePts += 2;
          if (this.one.ltrack) this.onePts -= 1;
          if (this.one.llane)  this.onePts -= 1;
          if (this.one.fstart) this.onePts -= 1;
          if (this.one.mstart) this.onePts -= 1;
          if (this.one.interference) this.onePts -= 3;
          if (this.two.interference) this.onePts += 3;

          // Penalty/bonus calculations for team 2
          if (this.two.stop)   this.twoPts += 2;
          if (this.two.ltrack) this.twoPts -= 1;
          if (this.two.llane)  this.twoPts -= 1;
          if (this.two.fstart) this.twoPts -= 1;
          if (this.two.mstart) this.twoPts -= 1;
          if (this.two.interference) this.twoPts -= 3;
          if (this.one.interference) this.twoPts += 3;
        },
        // This method submits the data to the remote database server
        submitData: function() {
          if (this.mutex) return;
          this.mutex = true;

          // Validate the data
          if (this.one.id == this.two.id) {
            // Invalid team ID
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar({message: 'Team ID\'s cannot be the same!'});
            this.mutex = false;
            return;
          }
          this.calculatePoints();

          orc.sendAuthenticatedRequest('POST', API_BACKEND + '/dragrace', {one: {id: this.one.id, pts: this.onePts}, two: {id: this.two.id, pts: this.twoPts}}, (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              // Clear the table
              this.one.id = 0;
              this.one.time = 0;
              this.two.id = 0;
              this.two.time = 0;
            }
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            this.mutex = false;
          }, this);
        }
      },
      watch: {
        // Watch whenenver the checkboxes change and recalculate the points
        one: {
          handler: function(v, ov) {
            this.calculatePoints();
          },
          deep: true
        },
        two: {
          handler: function(v, ov) {
            this.calculatePoints();
          },
          deep: true
        }
      }
    });

    // Da vinci
    this.davinciApp = new Vue({
      el: '#davinci',
      data: {
        teamid: 0,
        raw: [{clt: 0, co: 0, vir: 0, qp: 0, dd: 0},{clt: 0, co: 0, vir: 0, qp: 0, dd: 0},{clt: 0, co: 0, vir: 0, qp: 0, dd: 0},{clt: 0, co: 0, vir: 0, qp: 0, dd: 0}],
        totals: [0,0,0,0],
        mutex: false
      },
      methods: {
        calculatePoints: function() {
          // sum up points
          for (var i = 0; i < this.totals.length; i++)
            this.totals[i] = this.raw[i].clt + this.raw[i].co + this.raw[i].vir + this.raw[i].qp + this.raw[i].dd;
        },
        // This method submits the data to the remote database server
        submitData: function() {
          if (this.mutex) return;
          this.mutex = true;

          // Calculate points
          this.calculatePoints();

          orc.sendAuthenticatedRequest('POST', API_BACKEND + '/davinci', {teamid: this.teamid, pts: this.totals}, (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              // Clear table
              for (var i = 0; i < this.totals.length; i++) {
                this.raw[i].clt = this.raw[i].co = this.raw[i].vir = this.raw[i].qp = this.raw[i].dd = 0;
              }
            }
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            this.mutex = false;
          }, this);
        }
      },
      watch: {
        // Watch whenenver the checkboxes change and recalculate the points
        raw: {
          handler: function(v, ov) {
            this.calculatePoints();
          },
          deep: true
        }
      }
    });

    // Green arm is not using this

    // LRT
    this.lrtApp = new Vue({
      el: '#lrt',
      data: {
        teamid: 0,
        teamtime1: 0,
        teamtime2: 0,
        teamavg: 0,
        mutex: false
      },
      methods: {
        calculatePoints: function() {
          if (this.teamtime2 > 0) {
            // Average the two
            this.teamavg = (this.teamtime2 + this.teamtime1) / 2;
          } else {
            // Just use the 1st one
            this.teamavg = this.teamtime1;
          }
        },
        // This method submits the data to the remote database server
        submitData: function() {
          if (this.mutex) return;
          this.mutex = true;

          // Validate the data
          if (this.teamtime1 == 0) {
            // Invalid team ID
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar({message: 'Primary round time cannot be zero!'});
            this.mutex = false;
            return;
          }
          this.calculatePoints();

          orc.sendAuthenticatedRequest('POST', API_BACKEND + '/lrt', {team: {id: this.teamid, time: this.teamavg}}, (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              // Clear table
              this.teamid = 0;
              this.teamtime1 = 0;
              this.teamtime2 = 0;
            }
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            this.mutex = false;
          }, this);
        }
      }
    });

    // Interview
    this.interviewApp = new Vue({
      el: '#interview',
      data: {
        teamid: 0,
        one: {
          teampoints: 0,
        },
        two: {
          teampoints: 0,
        },
        teampoints: 0,
        mutex: false
      },
      methods: {
        // This method submits the data to the remote database server
        submitData: function() {
          if (this.mutex) return;
          this.mutex = true;

          // Validate the data
          if (this.one.teampoints > 32 || this.two.teampoints > 32) {
            // Invalid team ID
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar({message: 'Points score too high for interview!'});
            this.mutex = false;
            return;
          }

          // average the data
          this.teampoints = (this.one.teampoints + this.two.teampoints) / 2;

          orc.sendAuthenticatedRequest('POST', API_BACKEND + '/interview', {team: {id: this.teamid, pts: this.teampoints}}, (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              // Clear the table
              this.teamid = 0;
              this.one.teampoints = 0;
              this.two.teampoints = 0;
              this.teampoints = 0;
            }
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            this.mutex = false;
          }, this);
        }
      }
    });

  }.bind(this));
}

// Triggered on Firebase auth state change.
IEEEORC.prototype.onAuthStateChanged = function(user) {
  if (user) {
    this.styleContainer.textContent = '.cards-signed-out{ display: none; } .cards-signed-in{ display: block; }';
    this.signedInUser = user;
    this.userNameContainer.textContent = this.signedInUser.displayName;
  } else {
    this.styleContainer.textContent = '.cards-signed-out{ display: block; } .cards-signed-in{ display: none; }';
  }
};

// Initiates the sign-in flow using GoogleAuthProvider sign in in a popup.
IEEEORC.prototype.signIn = function() {
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

// Signs-out of Firebase.
IEEEORC.prototype.signOut = function() {
  firebase.auth().signOut();
};

// Tells the database to calculate the final results
var recalculateMutex;
IEEEORC.prototype.recalculateScores = function() {
  if (recalculateMutex) return;
  this.recalculateButton.disabled = recalculateMutex = true;
  console.log(this.recalculateButton);
  this.sendAuthenticatedRequest('GET', API_BACKEND + '/calculate',  (res, err) => {
    var data;
    if (err) {
      data = {message: 'Error calculating results: ' + (res ? JSON.parse(res).message : err)};
    } else {
      data = JSON.parse(res);
    }
    this.recalculateButton.disabled = recalculateMutex = false;
    document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
  });
};

// Does an authenticated request to a Firebase Functions endpoint using an Authorization header.
IEEEORC.prototype.sendAuthenticatedRequest = function(method, url, body, callback) {
  if (method == 'POST' || method == 'PUT') {
    // We are expecting a body, so the callback would be the 4th argument
  } else if (method == 'GET') {
    // The 3rd argument is the callback, not the body
    callback = body;
    body = null;
  } else {
    // Unsupported
    if (callback) callback(null, 'Unsupported HTTP method!');
    return;
  }

  // Authenticate the user before sending anything
  firebase.auth().currentUser.getIdToken().then(function(token) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      if (callback) callback(req.responseText);
    }.bind(this);
    req.onerror = function(err) {
      if (callback) callback(null, err);
    }.bind(this);
    req.open(method, url, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    if (body) {
      // POST/PUT request has a JSON body
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.send(JSON.stringify(body));
    } else {
      req.send();
    }
  }.bind(this));
};

// Load the demo.
window.orc = new IEEEORC();
