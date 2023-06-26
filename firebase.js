import { initializeApp } from 'firebase/app';
import { getDatabase } from  '@firebase/database';


const firebaseConfig = {
  // Firebase configuration
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: "zupanvoicereco.firebaseapp.com",
  databaseURL: "https://zupanvoicereco-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zupanvoicereco",
  storageBucket: "zupanvoicereco.appspot.com",
  messagingSenderId: "105878091174",
  appId: "1:105878091174:web:d420df7358e95a1fd80b67"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);