import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDmg_AV7_5h9vvxbEgP6Cw8dos8c5WRG_M",
  authDomain: "competitions-49482.firebaseapp.com",
  databaseURL: "https://competitions-49482-default-rtdb.firebaseio.com",
  projectId: "competitions-49482",
  storageBucket: "competitions-49482.appspot.com",
  messagingSenderId: "41314751254",
  appId: "1:41314751254:web:bbd6e98b0c3c1eed5fb637",
  measurementId: "G-JLC7Z62VVN"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export { db };