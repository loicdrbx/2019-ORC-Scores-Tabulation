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
const API_BACKEND = 'https://orc.ohnx.cf/api';

// Initializes the IEEE ORC app.
function IEEEORC() {
  document.addEventListener('DOMContentLoaded', function() {
    // Shortcuts to DOM Elements.
    this.signInButton = document.getElementById('btn-sign-in');
    this.signOutButton = document.getElementById('btn-sign-out');
    this.styleContainer = document.getElementById('dyn-signin');
    this.userNameContainer = document.getElementById('user-name');

    // Initialize the Firebase app.
    firebase.initializeApp(firebaseConfig);

    // Bind events.
    this.signInButton.addEventListener('click', this.signIn.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged.bind(this));
    this.signedInUser = null;

    // Setup Vue apps for each competition

    // Sumo
    this.sumoApp = new Vue({
      el: '#sumo',
      data: {
        points: [],
        // This is a mutex used to prevent sending multiple requests to the server storing the same info
        mutex: false
      },
      methods: {
        // This method refreshes the data to the remote database server
        refreshData: function() {
          if (this.mutex) return;
          this.mutex = true;

          orc.sendAuthenticatedRequest('GET', API_BACKEND + '/results/sumo', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error fetching: ' + (res ? JSON.parse(res).message : err)};
              document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            } else {
              data = JSON.parse(res);
              console.log(data);
              this.points = data;
            }
            this.mutex = false;
          }, this);
        }
      }
    });

    // Drag race
    this.dragApp = new Vue({
      el: '#dragrace',
      data: {
        points: [],
        mutex: false
      },
      methods: {
        // This method submits the data to the remote database server
        refreshData: function() {
          if (this.mutex) return;
          this.mutex = true;

          orc.sendAuthenticatedRequest('GET', API_BACKEND + '/results/dragrace', (res, err) => {
            var data;
            if (err) {
              data = {message: 'Error fetching: ' + (res ? JSON.parse(res).message : err)};
              document.getElementById('snackbar').MaterialSnackbar.showSnackbar(data);
            } else {
              data = JSON.parse(res);
              console.log(data);
              this.points = data;
            }
            this.mutex = false;
          }, this);
        }
      }
    });

    setTimeout(function() {
      this.sumoApp.refreshData();
      this.dragApp.refreshData();
      setInterval(function() {
        this.sumoApp.refreshData();
        this.dragApp.refreshData();
      }.bind(this), 10000);
    }.bind(this), 1000);

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
