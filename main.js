// GÜNCEL KOD: sendPasswordResetEmail fonksiyonunu import ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Senin Firebase projenin kimlik bilgileri.
const firebaseConfig = {
  apiKey: "AIzaSyDAlIpvrMtKbfOJmTo1Ut4H3lV3KMePQZo",
  authDomain: "lezzet-yagmuru.firebaseapp.com",
  projectId: "lezzet-yagmuru",
  storageBucket: "lezzet-yagmuru.appspot.com",
  messagingSenderId: "435103121551",
  appId: "1:435103121551:web:3ad5ce4a45b557e026f0fa",
  measurementId: "G-805ZG6M5VK"
};

// Firebase'i ve servisleri başlat
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

document.addEventListener('DOMContentLoaded', () => {
    // --- YENİ Element Seçimleri ---
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const resetModalCloseButton = document.getElementById('reset-modal-close-button');
    const resetPasswordForm = document.getElementById('reset-password-form');
    // --- Diğer Element Seçimleri ---
    const langContainer = document.querySelector('.language-selector-container');
    const authScreen = document.getElementById('auth-screen');
    const selectTR = document.getElementById('select-tr');
    // ... (diğer tüm element seçimleri aynı kalacak)
    
    // texts objesi ve diğer fonksiyonlar aynı...

    // --- YENİ Olay Yöneticileri ---
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetPasswordModal.classList.remove('hidden');
    });

    resetModalCloseButton.addEventListener('click', () => {
        resetPasswordModal.classList.add('hidden');
    });

    resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        sendPasswordResetEmail(auth, email)
            .then(() => {
                resetPasswordModal.classList.add('hidden');
                showNotification(texts[currentLang].reset_email_sent, 'success');
            })
            .catch((error) => {
                console.error("Şifre sıfırlama hatası:", error);
                showNotification(error.message, 'error');
            });
    });

    // ... Diğer tüm fonksiyonlar ve olay yöneticileri aynı kalacak ...
});
