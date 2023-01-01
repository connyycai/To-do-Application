import firebase from "firebase/app";
import "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp3Ac8GMJJD_yTjbAfTAMuuSf_PSQptXk",
  authDomain: "todo-app-f0c03.firebaseapp.com",
  projectId: "todo-app-f0c03",
  storageBucket: "todo-app-f0c03.appspot.com",
  messagingSenderId: "979711544617",
  appId: "1:979711544617:web:d83300d84b91bd20e3bb38"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

export { app, auth };
