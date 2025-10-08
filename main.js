import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAlIpvrMtKbfOJmTo1Ut4H3lV3KMePQZo",
  authDomain: "lezzet-yagmuru.firebaseapp.com",
  projectId: "lezzet-yagmuru",
  storageBucket: "lezzet-yagmuru.appspot.com",
  messagingSenderId: "435103121551",
  appId: "1:435103121551:web:3ad5ce4a45b557e026f0fa",
  measurementId: "G-805ZG6M5VK"
};

const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

const rewardsData = {
    tr: [
        { id: 'tr01', points: 500, brand: 'coca-cola', description: "Coca-Cola ürünlerinde geçerli 150 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'tr02', points: 750, brand: 'nestle', description: "Nestlé ürünlerinde geçerli 150 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"},
        { id: 'tr03', points: 1000, brand: 'carrefoursa', description: "Tüm ürünlerde geçerli 100 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1"},
        { id: 'tr04', points: 1000, brand: 'coca-cola', description: "Coca-Cola ürünlerinde geçerli 350 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'tr05', points: 1500, brand: 'nestle', description: "Nestlé ürünlerinde geçerli 400 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"},
        { id: 'tr06', points: 2000, brand: 'coca-cola', description: "Coca-Cola ürünlerinde geçerli 750 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'tr07', points: 2000, brand: 'carrefoursa', description: "Tüm ürünlerde geçerli 200 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1"},
        { id: 'tr08', points: 5000, brand: 'coca-cola', description: "Coca-Cola ve Nestlé'de geçerli 2500 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'tr09', points: 10000, brand: 'carrefoursa', description: "Tüm ürünlerde geçerli 2000 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1"}
    ],
    en: [
        { id: 'en01', points: 500, brand: 'coca-cola', description: "5€ Points for Coca-Cola products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'en02', points: 750, brand: 'nestle', description: "7.5€ Points for Nestlé products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"},
        { id: 'en03', points: 1000, brand: 'carrefour', description: "5€ Points for all products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1"},
        { id: 'en04', points: 1000, brand: 'coca-cola', description: "12.5€ Points for Coca-Cola products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'en05', points: 1500, brand: 'nestle', description: "17.5€ Points for Nestlé products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"},
        { id: 'en06', points: 2000, brand: 'coca-cola', description: "30€ Points for Coca-Cola products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'en07', points: 2000, brand: 'carrefour', description: "12€ Points for all products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1"},
        { id: 'en08', points: 5000, brand: 'coca-cola', description: "50€ Points for Coca-Cola & Nestlé", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"},
        { id: 'en09', points: 10000, brand: 'carrefour', description: "80€ Points for all products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1"}
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        langSelect: document.getElementById('language-selector-screen'),
        auth: document.getElementById('auth-screen'),
        mainMenu: document.getElementById('main-menu-screen'),
        rewardsMarket: document.getElementById('rewards-market-screen'),
    };
    const notificationMessage = document.getElementById('notification-message');
    const marketNotification = document.getElementById('market-notification');
    const selectTR = document.getElementById('select-tr');
    const selectEU = document.getElementById('select-eu');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const countryWrapper = document.getElementById('country-wrapper');
    const carrefourLogo = document.getElementById('carrefour-logo');
    const howToPlayLink = document.getElementById('how-to-play-link');
    const infoModal = document.getElementById('info-modal');
    const modalCloseButton = document.getElementById('modal-close-button');
    const countrySelect = document.getElementById('register-country');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const resetModalCloseButton = document.getElementById('reset-modal-close-button');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const logoutButton = document.getElementById('logout-button');
    const rewardsMarketButton = document.getElementById('rewards-market-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');

    const texts = { /* ... Önceki tam texts objesi ... */ };
    
    let currentLang = 'tr';
    let currentUserData = {};

    onAuthStateChanged(auth, async (user) => {
        if (user && user.emailVerified) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                currentUserData = { uid: user.uid, email: user.email, ...userDocSnap.data() };
                currentLang = currentUserData.region || 'tr';
                updateTexts(currentLang);
                showScreen('mainMenu');
                document.getElementById('user-email-display').textContent = currentUserData.email;
                document.getElementById('user-points').textContent = currentUserData.points || 0;
            }
        } else {
            showScreen('langSelect');
        }
    });

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
        }
    }

    function showNotification(message, type = 'error', target = notificationMessage) {
        target.textContent = message;
        target.className = `notification ${type}`;
        setTimeout(() => { target.className = 'notification hidden'; }, 5000);
    }

    function updateTexts(lang) { /* ... Önceki tam updateTexts fonksiyonu ... */ }
    function handleSelection(selection) { /* ... Önceki tam handleSelection fonksiyonu ... */ }
    function switchTab(event, tabName) { /* ... Önceki tam switchTab fonksiyonu ... */ }

    function renderRewardsMarket() {
        const rewardsList = document.getElementById('rewards-list');
        rewardsList.innerHTML = '';
        const langRewards = rewardsData[currentLang] || [];
        
        langRewards.forEach(reward => {
            const canAfford = currentUserData.points >= reward.points;
            const card = document.createElement('div');
            card.className = 'reward-card';
            card.innerHTML = `<img src="${reward.logo}" alt="${reward.brand}" class="reward-logo"><p class="reward-description">${reward.description}</p><div class="reward-points">${reward.points} ${texts[currentLang].points_label}</div><button class="claim-button" data-reward-id="${reward.id}" ${canAfford ? '' : 'disabled'}>${canAfford ? (texts[currentLang].claim_button || 'Satın Al') : (texts[currentLang].insufficient_points || 'Yetersiz Puan')}</button>`;
            rewardsList.appendChild(card);
        });

        rewardsList.querySelectorAll('.claim-button').forEach(button => {
            button.addEventListener('click', handlePurchase);
        });
    }

    async function handlePurchase(event) {
        const button = event.target;
        const rewardId = button.dataset.rewardId;
        const langRewards = rewardsData[currentLang] || [];
        const reward = langRewards.find(r => r.id === rewardId);

        if (!reward || currentUserData.points < reward.points) {
            showNotification(texts[currentLang].purchase_fail || "Yetersiz puan.", 'error', marketNotification);
            return;
        }

        if (confirm(`${reward.points} ${texts[currentLang].points_label} kullanarak bu ödülü almak istediğinizden emin misiniz?`)) {
            const userDocRef = doc(db, 'users', currentUserData.uid);
            try {
                await updateDoc(userDocRef, { points: increment(-reward.points) });
                currentUserData.points -= reward.points;
                document.getElementById('user-points').textContent = currentUserData.points;
                document.getElementById('market-user-points').textContent = currentUserData.points;
                renderRewardsMarket();
                showNotification(texts[currentLang].purchase_success, 'success', marketNotification);
            } catch (error) {
                console.error("Puan güncelleme hatası:", error);
                showNotification("Bir hata oluştu. Lütfen tekrar deneyin.", 'error', marketNotification);
            }
        }
    }
    
    // Olay Yöneticileri
    selectTR.addEventListener('click', () => handleSelection('tr'));
    selectEU.addEventListener('click', () => handleSelection('en'));
    loginTab.addEventListener('click', (e) => switchTab(e, 'login'));
    // ... Diğer tüm olay yöneticileri ...
});
