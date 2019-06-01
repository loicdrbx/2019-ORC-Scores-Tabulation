/* global firebase, Vue, orc */
'use strict';

// Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyAE4eRBKFJ7rZ11eU-WWJp5VKA9S5JuJhA',
  authDomain: 'ieee-orc.firebaseapp.com',
  databaseURL: 'https://ieee-orc.firebaseio.com',
  projectId: 'ieee-orc',
  storageBucket: 'ieee-orc.appspot.com',
  messagingSenderId: '547825791862',
  appId: '1:547825791862:web:e47809a421a8153b'
};

// Initializes the IEEE ORC app.
function IEEEORC() {
  document.addEventListener('DOMContentLoaded', function() {
    // Shortcuts to DOM Elements.
    this.signInButton = document.getElementById('btn-sign-in');
    this.signOutButton = document.getElementById('btn-sign-out');
    this.styleContainer = document.getElementById('dyn-signin');
    this.userNameContainer = document.getElementById('user-name');
    this.userIsAdmin = false;

    // Initialize the Firebase app.
    //firebase.initializeApp(firebaseConfig);

    // Bind events.
    this.signInButton.addEventListener('click', this.signIn.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    //firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
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

          orc.sendAuthenticatedRequest('POST', 'https://TODO', 'data', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              if (data.message.indexOf('success') >= 0) {
                Object.keys(this.students).forEach(key => {
                });
              }
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

          orc.sendAuthenticatedRequest('POST', 'https://TODO', 'data', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              if (data.message.indexOf('success') >= 0) {
                Object.keys(this.students).forEach(key => {
                });
              }
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
        one: {
          id: 0,
          clt: 0,
          co: 0,
          vir: 0,
          qp: 0,
          dd: 0,
        },
        onePts: 0,
        two: {
          id: 0,
          clt: 0,
          co: 0,
          vir: 0,
          qp: 0,
          dd: 0,
        },
        twoPts: 0,
        mutex: false
      },
      methods: {
        calculatePoints: function() {
          // Reset points
          this.onePts = 0;
          this.twoPts = 0;

          // sum up points
          this.onePts = this.one.clt + this.one.co + this.one.vir + this.one.qp + this.one.dd;
          this.twoPts = this.two.clt + this.two.co + this.two.vir + this.two.qp + this.two.dd;
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

          orc.sendAuthenticatedRequest('POST', 'https://TODO', 'data', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              if (data.message.indexOf('success') >= 0) {
                Object.keys(this.students).forEach(key => {
                });
              }
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

          orc.sendAuthenticatedRequest('POST', 'https://TODO', 'data', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              if (data.message.indexOf('success') >= 0) {
                Object.keys(this.students).forEach(key => {
                });
              }
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
        teampoints: 0,
        mutex: false
      },
      methods: {
        // This method submits the data to the remote database server
        submitData: function() {
          if (this.mutex) return;
          this.mutex = true;

          // Validate the data
          if (this.teampoints > 32) {
            // Invalid team ID
            document.getElementById('snackbar').MaterialSnackbar.showSnackbar({message: 'Points score too high for interview!'});
            this.mutex = false;
            return;
          }

          orc.sendAuthenticatedRequest('POST', 'https://TODO', 'data', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error recording: ' + (res ? JSON.parse(res).message : err)};
            } else {
              data = JSON.parse(res);
              if (data.message.indexOf('success') >= 0) {
                Object.keys(this.students).forEach(key => {
                });
              }
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
  //firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
};

// Signs-out of Firebase.
IEEEORC.prototype.signOut = function() {
  //firebase.auth().signOut();
};

// Does an authenticated request to a Firebase Functions endpoint using an Authorization header.
IEEEORC.prototype.sendAuthenticatedRequest = function(method, url, body, callback) {
  if (method == 'POST' || method == 'PUT') {
    // We are expecting a body, so the callback would be the 4th argument
  } else if (method == 'GET') {
    // The 3rd argument is the callback, not the body
    callback = body;
  } else {
    // Unsupported
    if (callback) callback(null, 'Unsupported HTTP method!');
    return;
  }

  // Authenticate the user before sending anything
  /*firebase.auth().currentUser.getIdToken().then(function(token) {
    var req = new XMLHttpRequest();
    req.onload = function() {
      if (callback) callback(req.responseText);
    }.bind(this);
    req.onerror = function(err) {
      if (callback) callback(null, err);
    }.bind(this);
    req.open(method, url, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.send();
  }.bind(this));*/
};

// Load the demo.
window.orc = new IEEEORC();
