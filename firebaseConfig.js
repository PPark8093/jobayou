// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3UYqYLiiGBroYoYbJaxQ25LQlOiHuoPk",
  authDomain: "jobayou-f1172.firebaseapp.com",
  projectId: "jobayou-f1172",
  storageBucket: "jobayou-f1172.firebasestorage.app",
  messagingSenderId: "98819274997",
  appId: "1:98819274997:web:8ee65ce7e81c30e0f5edbc",
  databaseURL: "https://jobayou-f1172-default-rtdb.firebaseio.com"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const database = getDatabase(app);