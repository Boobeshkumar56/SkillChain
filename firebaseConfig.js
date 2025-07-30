// Import the functions you need from the SDKs you need
import { getAnalytics ,isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnQQGuROrC5S1FCwKHiCUd_SOd6AdEUbI",
  authDomain: "skillchain-951db.firebaseapp.com",
  projectId: "skillchain-951db",
  storageBucket: "skillchain-951db.firebasestorage.app",
  messagingSenderId: "820846877419",
  appId: "1:820846877419:web:3f6dc2f8257ac746233cae",
  measurementId: "G-FRPTNRDCHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.log("Analytics not supported:", err.message);
    });
}

export default app;
export const auth = getAuth(app);