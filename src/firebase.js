import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBE_CRagOceK5hqeTQV7Bny_vVqW219dlI",
    authDomain: "my-cmdb-db.firebaseapp.com",
    databaseURL: "https://my-cmdb-db-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "my-cmdb-db",
    storageBucket: "my-cmdb-db.firebasestorage.app",
    messagingSenderId: "780013714003",
    appId: "1:780013714003:web:70f3a47a3ed9996de724a6",
    measurementId: "G-8KPSXEJT6D"
};

// Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);

// Експортуємо базу даних, щоб використовувати її в App.jsx
export const db = getDatabase(app);