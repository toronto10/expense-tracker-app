import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
apiKey: "AIzaSyBURKhON39TbBHBKBz17m-i5eq1T7_GwTs",
  authDomain: "depense-5cd0a.firebaseapp.com",
  projectId: "depense-5cd0a",
  storageBucket: "depense-5cd0a.firebasestorage.app",
  messagingSenderId: "1043427702935",
  appId: "1:1043427702935:web:3c6deef77e21b0ce88d1d2",
  measurementId: "G-NSL1DRFDNM"
}

// Initialisation avec logs de débogage
console.log("🔥 Initialisation de Firebase...")
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
console.log("✅ Firebase initialisé avec succès")
