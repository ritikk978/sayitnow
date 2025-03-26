// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAq4S1YhS3gBb9-_myUpIjkc4wjM1nD8BM",
    authDomain: "texttospeech-aef57.firebaseapp.com",
    projectId: "texttospeech-aef57",
    storageBucket: "texttospeech-aef57.firebasestorage.app",
    messagingSenderId: "768202395063",
    appId: "1:768202395063:web:635e20aa02b09ae0bbec32"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
