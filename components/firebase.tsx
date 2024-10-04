import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCR6JZWFeUNZdTXZXAjWKLsAYmB5oa72eI",
    authDomain: "next-js-project-141b7.firebaseapp.com",
    projectId: "next-js-project-141b7",
    storageBucket: "next-js-project-141b7.appspot.com",
    messagingSenderId: "441199459014",
    appId: "1:441199459014:web:7e835cfe1d10805ee275c7",
    measurementId: "G-ZCCK0Q9CQV"
};

export const firebase = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebase);
export const storage = getStorage(firebase);
export const auth = getAuth(firebase);