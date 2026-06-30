import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBHxyFCj3_v0h8ToPSFbOYXcSFylqSQy_s",
  authDomain: "newbornfollowup.firebaseapp.com",
  projectId: "newbornfollowup",
  storageBucket: "newbornfollowup.firebasestorage.app",
  messagingSenderId: "830001060129",
  appId: "1:830001060129:web:b1db328bddf5687c2f8660",
  measurementId: "G-KPGXQD385K"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
