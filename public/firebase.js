import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// YOU WILL PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyAkERVF9uWwV-ZtsSyb0D4W7DMc9TzPcUo",
  authDomain: "multiplayer-3d-game-84250.firebaseapp.com",
  projectId: "multiplayer-3d-game-84250",
  storageBucket: "multiplayer-3d-game-84250.firebasestorage.app",
  messagingSenderId: "824054306670",
  appId: "1:824054306670:web:2f6908c2f4c84d443cd37f",
  measurementId: "G-CDRWN64TRF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function signup(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return await signOut(auth);
}

export function getUser() {
  return auth.currentUser;
}

export async function getToken() {
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
}
