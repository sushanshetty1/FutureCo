import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyABx3-PqoOufb52ECDAZt7uL4ZjkjbYHSM",
  authDomain: "futureco-1.firebaseapp.com",
  projectId: "futureco-1",
  storageBucket: "futureco-1.firebasestorage.app",
  messagingSenderId: "811367283994",
  appId: "1:811367283994:web:c20e6d2091a5b837d3c0a3",
  measurementId: "G-7NE3RGDPR1"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

githubProvider.setCustomParameters({
  prompt: 'consent'
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, googleProvider, githubProvider, db };
