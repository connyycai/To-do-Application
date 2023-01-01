import firebase from "firebase/app";
var admin = require("firebase-admin");
var credentials = require("./cred.json");

firebase.initializeApp({
  credential: firebase.credential.cert(credentials)
});

module.exports = admin;
