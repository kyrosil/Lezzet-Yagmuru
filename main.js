import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";
import { createGame } from './game.js';

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
const functions = getFunctions(fbApp);

const rewardsData = {
    tr: [ { id: 'tr01', points: 500, brand: 'coca-cola', description: "Coca-Cola ürünlerinde geçerli 150 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'tr02', points: 750, brand: 'nestle', description: "Nestlé ürünlerinde geçerli 150 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"}, { id: 'tr03', points: 1000, brand: 'carrefoursa', description: "Tüm ürünlerde geçerli 100 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1"}, { id: 'tr04', points: 1000, brand: 'coca-cola', description: "Coca-Cola ürünlerinde geçerli 350 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'tr05', points: 1500, brand: 'nestle', description: "Nestlé ürünlerinde geçerli 400 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"}, { id: 'tr06', points: 2000, brand: 'coca-cola', description: "Coca-Cola ürünlerinde geçerli 750 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'tr07', points: 2000, brand: 'carrefoursa', description: "Tüm ürünlerde geçerli 200 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1"}, { id: 'tr08', points: 5000, brand: 'coca-cola', description: "Coca-Cola ve Nestlé'de geçerli 2500 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'tr09', points: 10000, brand: 'carrefoursa', description: "Tüm ürünlerde geçerli 2000 TL Puan", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1"} ],
    en: [ { id: 'en01', points: 500, brand: 'coca-cola', description: "5€ Points for Coca-Cola products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'en02', points: 750, brand: 'nestle', description: "7.5€ Points for Nestlé products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"}, { id: 'en03', points: 1000, brand: 'carrefour', description: "5€ Points for all products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1"}, { id: 'en04', points: 1000, brand: 'coca-cola', description: "12.5€ Points for Coca-Cola products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'en05', points: 1500, brand: 'nestle', description: "17.5€ Points for Nestlé products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-3.png?ssl=1"}, { id: 'en06', points: 2000, brand: 'coca-cola', description: "30€ Points for Coca-Cola products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'en07', points: 2000, brand: 'carrefour', description: "12€ Points for all products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1"}, { id: 'en08', points: 5000, brand: 'coca-cola', description: "50€ Points for Coca-Cola & Nestlé", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-5.png?ssl=1"}, { id: 'en09', points: 10000, brand: 'carrefour', description: "80€ Points for all products", logo: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1"} ]
};

document.addEventListener('DOMContentLoaded', () => {
    const screens = { langSelect: document.getElementById('language-selector-screen'), auth: document.getElementById('auth-screen'), mainMenu: document.getElementById('main-menu-screen'), rewardsMarket: document.getElementById('rewards-market-screen'), myPurchases: document.getElementById('my-purchases-screen'), game: document.getElementById('game-screen') };
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
    const myPurchasesButton = document.getElementById('my-purchases-button');
    const purchasesBackButton = document.getElementById('purchases-back-button');
    const promoCodeInput = document.getElementById('promo-code-input');
    const redeemCodeButton = document.getElementById('redeem-code-button');
    const startGameButton = document.getElementById('start-game-button');
    const returnToMenuButton = document.getElementById('return-to-menu-button');
    
    const texts = {
        tr: {
            carrefour_logo_url: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1", lang_select_title: "Konumunu Seç", location_warning: "<strong>ÖNEMLİ:</strong> Ödüllerin doğru bir şekilde tanımlanabilmesi için lütfen yaşadığınız bölgeyi doğru seçiniz.", welcome_title: "Lezzet Yağmuru'na Hoş Geldin!", login: "Giriş Yap", register: "Kayıt Ol", email_placeholder: "E-posta Adresi", password_placeholder: "Şifre", social_placeholder: "Sosyal Medya Kullanıcı Adı", card_gsm_placeholder: "CarrefourSA Kart No / GSM No",
            card_info: `Kartınız yok mu? <a href="https://www.carrefoursakart.com/" target="_blank">Hemen oluşturun!</a>`,
            follow_text: "@Kyrosil hesabını takip ediyorum.", how_to_play: "Nasıl Oynanır & Ödüller", modal_title: "Nasıl Oynanır & Ödüller", modal_rules_title: "Oyun Kuralları",
            modal_rules_text: "CarrefourSA sepeti ile yukarıdan yağan Coca-Cola ürünlerini yakala. Farklı markalara ve bombalara dikkat et! Nestlé ürünleri sana özel güçler kazandıracak. 3 Coca-Cola şişesi kaçırırsan oyun biter.",
            modal_rewards_title: "Türkiye Ödülleri", rewards: rewardsData.tr.map(r => `<strong>${r.points} PUAN:</strong> ${r.description}`),
            modal_claim_title: "Ödül Nasıl Talep Edilir?", modal_claim_text: `Ödül Marketi'ndeki 'Satın Al' butonuna tıklayarak puanlarını kullanabilir ve talebini bize e-posta ile bildirebilirsin.`,
            register_success: "Kayıt başarılı! Lütfen e-posta kutunuzu kontrol ederek hesabınızı doğrulayın.", login_success: "Giriş başarılı!", login_unverified: "Lütfen önce e-postanızı onaylayın.", login_fail: "Giriş başarısız oldu. Bilgilerinizi kontrol edin.",
            forgot_password: "Şifremi Unuttum?", reset_modal_title: "Şifre Sıfırla", reset_modal_text: "Kayıtlı e-posta adresinizi girin, size sıfırlama linki göndereceğiz.", reset_button: "Sıfırlama Linki Gönder", reset_email_sent: "Şifre sıfırlama e-postası gönderildi. Kutunuzu kontrol edin.",
            menu_welcome_title: "Hoş Geldin", points_label: "PUAN", start_game_button: "OYUNA BAŞLA", rewards_market_button: "ÖDÜL MARKETİ", my_purchases_button: "SATIN ALIMLARIM", logout_button: "Çıkış Yap", market_title: "Ödül Marketi", claim_button: "Satın Al", insufficient_points: "Yetersiz Puan",
            purchase_success_part1: "Ödül talebiniz alındı! İşlemi tamamlamak için lütfen aşağıdaki linke tıklayarak bize, otomatik oluşturulan e-postayı gönderin:", purchase_success_part2: "E-POSTA GÖNDER", purchase_fail: "Bu ödülü almak için yeterli puanınız yok.",
            purchases_title: "Satın Alımlarım", no_purchases: "Henüz bir satın alım yapmadınız.", inceleniyor: "İnceleniyor", tanımlandı: "Tanımlandı", loading: "Yükleniyor...", promo_title: "Promosyon Kodu", redeem_button: "Kullan",
            no_more_tries: "Bugünkü oyun hakkın bitti! Yarın tekrar oyna.", game_over_title: "Oyun Bitti!", final_score_text: "Skorun:", return_to_menu_button: "Ana Menü'ye Dön"
        },
        en: {
            carrefour_logo_url: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1", lang_select_title: "Select Your Location", location_warning: "<strong>IMPORTANT:</strong> To ensure correct prize allocation, please select the region you live in.", welcome_title: "Welcome to Taste Rain!", login: "Login", register: "Sign Up", email_placeholder: "Email Address", password_placeholder: "Password", social_placeholder: "Social Media Username", card_gsm_placeholder: "Carrefour Card No / Mobile No",
            card_info: "If you don't have a card, enter your mobile number. You will need to create a card in-store to claim your prize.",
            follow_text: "I am following the @Kyrosil account.", how_to_play: "How to Play & Prizes", modal_title: "How to Play & Prizes", modal_rules_title: "Game Rules",
            modal_rules_text: "Catch the falling Coca-Cola products with the Carrefour cart. Watch out for other brands and bombs! Nestlé products will give you special powers. The game ends if you miss 3 Coca-Cola bottles.",
            modal_rewards_title: "Europe Prizes", rewards: rewardsData.en.map(r => `<strong>${r.points} PTS:</strong> ${r.description}`),
            modal_claim_title: "How to Claim a Prize?", modal_claim_text: `You can use your points by clicking the 'Purchase' button in the Rewards Market and notify us of your claim via email.`,
            register_success: "Registration successful! Please check your email inbox to verify your account.", login_success: "Login successful!", login_unverified: "Please verify your email before logging in.", login_fail: "Login failed. Please check your credentials.",
            forgot_password: "Forgot Password?", reset_modal_title: "Reset Password", reset_modal_text: "Enter your registered email address. We will send you a link to reset your password.", reset_button: "Send Reset Link", reset_email_sent: "Password reset email sent. Please check your inbox.",
            menu_welcome_title: "Welcome", points_label: "POINTS", start_game_button: "START GAME", rewards_market_button: "REWARDS MARKET", my_purchases_button: "MY PURCHASES", logout_button: "Logout", market_title: "Rewards Market", claim_button: "Purchase", insufficient_points: "Insufficient Points",
            purchase_success_part1: "Your reward claim has been received! To complete the process, please send us the auto-generated email by clicking the link below:", purchase_success_part2: "SEND EMAIL", purchase_fail: "You do not have enough points for this reward.",
            purchases_title: "My Purchases", no_purchases: "You have not made any purchases yet.", inceleniyor: "Under Review", tanımlandı: "Completed", loading: "Loading...", promo_title: "Promotion Code", redeem_button: "Redeem",
            no_more_tries: "You are out of tries for today! Come back tomorrow.", game_over_title: "Game Over!", final_score_text: "Your Score:", return_to_menu_button: "Return to Main Menu"
        }
    };
    
    let currentLang = 'tr';
    let currentUserData = {};
    let activeGame = null;

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
            } else { signOut(auth); }
        } else {
            showScreen('langSelect');
        }
    });

    function showScreen(screenNameKey) { Object.values(screens).forEach(screen => { if (screen) screen.classList.add('hidden'); }); if (screens[screenNameKey]) screens[screenNameKey].classList.remove('hidden'); }
    function showNotification(message, type = 'error', target = notificationMessage) { target.innerHTML = message; target.className = `notification ${type}`; setTimeout(() => { target.className = 'notification hidden'; }, 10000); }
    
    function updateTexts(lang) {
        const langData = texts[lang]; if (!langData) return;
        countrySelect.required = (lang === 'en');
        document.getElementById('lang-select-title').textContent = langData.lang_select_title;
        document.getElementById('location-warning-text').innerHTML = langData.location_warning;
        carrefourLogo.src = langData.carrefour_logo_url;
        document.getElementById('welcome-title').textContent = langData.welcome_title;
        document.getElementById('login-tab').textContent = langData.login;
        document.getElementById('register-tab').textContent = langData.register;
        document.getElementById('login-email').placeholder = langData.email_placeholder;
        document.getElementById('login-password').placeholder = langData.password_placeholder;
        document.getElementById('login-button').textContent = langData.login;
        document.getElementById('register-email').placeholder = langData.email_placeholder;
        document.getElementById('register-password').placeholder = langData.password_placeholder;
        document.getElementById('register-social').placeholder = langData.social_placeholder;
        document.getElementById('register-card-gsm').placeholder = langData.card_gsm_placeholder;
        document.getElementById('card-info-text').innerHTML = langData.card_info;
        document.getElementById('follow-label').textContent = langData.follow_text;
        document.getElementById('register-button').textContent = langData.register;
        document.getElementById('how-to-play-link').textContent = langData.how_to_play;
        forgotPasswordLink.textContent = langData.forgot_password;
        document.getElementById('modal-title').textContent = langData.modal_title;
        document.getElementById('modal-rules-title').textContent = langData.modal_rules_title;
        document.getElementById('modal-rules-text').textContent = langData.modal_rules_text;
        document.getElementById('modal-rewards-title').textContent = langData.modal_rewards_title;
        const rewardsList = langData.rewards.map(reward => `<li>${reward}</li>`).join('');
        document.getElementById('modal-rewards-text').innerHTML = `<ul>${rewardsList}</ul>`;
        document.getElementById('modal-claim-title').textContent = langData.modal_claim_title;
        document.getElementById('modal-claim-text').innerHTML = langData.modal_claim_text;
        document.getElementById('reset-modal-title').textContent = langData.reset_modal_title;
        document.getElementById('reset-modal-text').textContent = langData.reset_modal_text;
        document.getElementById('reset-email').placeholder = langData.email_placeholder;
        document.getElementById('reset-button').textContent = langData.reset_button;
        document.getElementById('menu-welcome-title').textContent = langData.menu_welcome_title;
        document.getElementById('points-label').textContent = langData.points_label;
        document.getElementById('start-game-button').textContent = langData.start_game_button;
        document.getElementById('rewards-market-button').textContent = langData.rewards_market_button;
        document.getElementById('my-purchases-button').textContent = langData.my_purchases_button;
        document.getElementById('logout-button').textContent = langData.logout_button;
        document.getElementById('market-title').textContent = langData.market_title;
        document.getElementById('market-points-label').textContent = langData.points_label;
        document.getElementById('purchases-title').textContent = langData.purchases_title;
        document.getElementById('promo-title').textContent = langData.promo_title;
        document.getElementById('redeem-code-button').textContent = langData.redeem_button;
        document.getElementById('score-label').textContent = langData.points_label;
        document.getElementById('game-over-title').textContent = langData.game_over_title;
        document.getElementById('final-score-text').textContent = langData.final_score_text;
        document.getElementById('return-to-menu-button').textContent = langData.return_to_menu_button;
    }

    function handleSelection(selection) {
        currentLang = selection; updateTexts(currentLang);
        screens.langSelect.classList.add('fade-out');
        setTimeout(() => { showScreen('auth'); screens.langSelect.classList.remove('fade-out');}, 300);
    }
    
    function switchTab(event, tabName) {
        event.preventDefault(); const isLogin = tabName === 'login';
        loginTab.classList.toggle('active', isLogin); registerTab.classList.toggle('active', !isLogin);
        loginForm.classList.toggle('hidden', !isLogin); registerForm.classList.toggle('hidden', isLogin);
    }
    
    function renderRewardsMarket() {
        const rewardsListEl = document.getElementById('rewards-list'); rewardsListEl.innerHTML = '';
        const langRewards = rewardsData[currentLang] || [];
        langRewards.forEach(reward => {
            const canAfford = currentUserData.points >= reward.points;
            const card = document.createElement('div');
            card.className = 'reward-card';
            card.innerHTML = `<img src="${reward.logo}" alt="${reward.brand}" class="reward-logo"><p class="reward-description">${reward.description}</p><div class="reward-points">${reward.points} ${texts[currentLang].points_label}</div><button class="claim-button" data-reward-id="${reward.id}" ${canAfford ? '' : 'disabled'}>${canAfford ? texts[currentLang].claim_button : texts[currentLang].insufficient_points}</button>`;
            rewardsListEl.appendChild(card);
        });
        rewardsListEl.querySelectorAll('.claim-button:not([disabled])').forEach(button => { button.addEventListener('click', handlePurchase); });
    }

    async function handlePurchase(event) {
        const rewardId = event.target.dataset.rewardId;
        const reward = (rewardsData[currentLang] || []).find(r => r.id === rewardId);
        if (!reward || currentUserData.points < reward.points) { showNotification(texts[currentLang].purchase_fail, 'error', marketNotification); return; }
        if (confirm(`${reward.points} ${texts[currentLang].points_label} kullanarak bu ödülü almak istediğinizden emin misiniz?`)) {
            const userDocRef = doc(db, 'users', currentUserData.uid);
            const claimsColRef = collection(userDocRef, 'claims');
            try {
                const newClaimRef = await addDoc(claimsColRef, { rewardId: reward.id, rewardDescription: reward.description, pointsSpent: reward.points, status: 'inceleniyor', claimedAt: serverTimestamp() });
                await updateDoc(userDocRef, { points: increment(-reward.points) });
                currentUserData.points -= reward.points;
                document.getElementById('user-points').textContent = currentUserData.points;
                document.getElementById('market-user-points').textContent = currentUserData.points;
                renderRewardsMarket();
                const mailSubject = encodeURIComponent(`Ödül Talebi: ${reward.description} (#${newClaimRef.id.substring(0,6)})`);
                const mailBody = encodeURIComponent(`Kullanıcı ID: ${currentUserData.uid}\nKullanıcı E-posta: ${currentUserData.email}\n\nTalep Edilen Ödül:\n- ID: ${newClaimRef.id}\n- Açıklama: ${reward.description}\n- Puan Değeri: ${reward.points}\n\nLütfen bu ödülü Carrefour kartıma/GSM numarama tanımlayın:\n- Kart/GSM No: ${currentUserData.card_gsm}`);
                const mailtoLink = `mailto:gifts@kyrosil.eu?subject=${mailSubject}&body=${mailBody}`;
                const successMessage = `${texts[currentLang].purchase_success_part1} <a href="${mailtoLink}" target="_blank">${texts[currentLang].purchase_success_part2}</a>`;
                showNotification(successMessage, 'success', marketNotification);
            } catch (error) { console.error("Satın alım hatası:", error); showNotification("Bir hata oluştu.", 'error', marketNotification); }
        }
    }
    
    async function renderMyPurchases() {
        const purchasesListEl = document.getElementById('purchases-list');
        purchasesListEl.innerHTML = `<p>${texts[currentLang].loading || 'Yükleniyor...'}</p>`;
        const claimsRef = collection(db, 'users', currentUserData.uid, 'claims');
        const q = query(claimsRef, orderBy('claimedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) { purchasesListEl.innerHTML = `<p>${texts[currentLang].no_purchases}</p>`; return; }
        purchasesListEl.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const claim = doc.data();
            const claimDate = claim.claimedAt ? claim.claimedAt.toDate().toLocaleDateString() : '';
            const statusText = texts[currentLang][claim.status] || claim.status;
            const item = document.createElement('div');
            item.className = 'purchase-item';
            item.innerHTML = `<div class="purchase-details"><span class="purchase-description">${claim.rewardDescription}</span><span class="purchase-date">${claimDate}</span></div><div class="purchase-status ${claim.status === 'tanımlandı' ? 'completed' : 'review'}">${statusText}</div>`;
            purchasesListEl.appendChild(item);
        });
    }

    async function handleGameOver(finalScore) {
        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('game-over-screen').classList.remove('hidden');
        if (finalScore > 0) {
            const userDocRef = doc(db, 'users', currentUserData.uid);
            await updateDoc(userDocRef, { points: increment(finalScore) });
            currentUserData.points += finalScore;
        }
    }

    // --- Olay Yöneticileri ---
    selectTR.addEventListener('click', () => handleSelection('tr'));
    selectEU.addEventListener('click', () => handleSelection('en'));
    loginTab.addEventListener('click', (e) => switchTab(e, 'login'));
    registerTab.addEventListener('click', (e) => switchTab(e, 'register'));
    howToPlayLink.addEventListener('click', (e) => { e.preventDefault(); infoModal.classList.remove('hidden'); });
    modalCloseButton.addEventListener('click', () => infoModal.classList.add('hidden'));
    forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); resetPasswordModal.classList.remove('hidden'); });
    resetModalCloseButton.addEventListener('click', () => resetPasswordModal.classList.add('hidden'));
    logoutButton.addEventListener('click', (e) => { e.preventDefault(); if(window.phaserGame){ window.phaserGame.destroy(true); window.phaserGame = null;} signOut(auth); });
    rewardsMarketButton.addEventListener('click', () => { showScreen('rewardsMarket'); document.getElementById('market-user-points').textContent = currentUserData.points || 0; renderRewardsMarket(); });
    backToMenuButton.addEventListener('click', () => { showScreen('mainMenu'); document.getElementById('user-points').textContent = currentUserData.points; });
    myPurchasesButton.addEventListener('click', () => { showScreen('myPurchases'); renderMyPurchases(); });
    purchasesBackButton.addEventListener('click', () => { showScreen('mainMenu'); });

    startGameButton.addEventListener('click', async () => {
        const userDocRef = doc(db, 'users', currentUserData.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        const today = new Date().toDateString();
        const lastPlayed = userData.lastPlayedDate || null;
        let triesLeft = userData.hasOwnProperty('dailyTriesLeft') ? userData.dailyTriesLeft : 3;
        if (today !== lastPlayed) {
            triesLeft = 3;
            await updateDoc(userDocRef, { dailyTriesLeft: 3, lastPlayedDate: today });
        }
        if (triesLeft > 0) {
            await updateDoc(userDocRef, { dailyTriesLeft: increment(-1) });
            showScreen('game');
            createGame(handleGameOver);
        } else {
            showNotification(texts[currentLang].no_more_tries, 'error');
        }
    });

    returnToMenuButton.addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        showScreen('mainMenu');
        if(window.phaserGame) { window.phaserGame.destroy(true); window.phaserGame = null; }
        document.getElementById('user-points').textContent = currentUserData.points;
    });

    loginForm.addEventListener('submit', (e) => { e.preventDefault(); const email = document.getElementById('login-email').value; const password = document.getElementById('login-password').value; signInWithEmailAndPassword(auth, email, password).then((userCredential) => { if (!userCredential.user.emailVerified) { signOut(auth); showNotification(texts[currentLang].login_unverified, 'error'); } }).catch(() => { showNotification(texts[currentLang].login_fail, 'error'); }); });
    registerForm.addEventListener('submit', async (e) => { e.preventDefault(); const email = document.getElementById('register-email').value; const password = document.getElementById('register-password').value; const userData = { social: document.getElementById('register-social').value, card_gsm: document.getElementById('register-card-gsm').value, isFollowing: document.getElementById('follow-confirm').checked, region: currentLang, points: 0, createdAt: serverTimestamp() }; if (currentLang === 'en') { userData.country = countrySelect.value; } try { const userCredential = await createUserWithEmailAndPassword(auth, email, password); await sendEmailVerification(userCredential.user); await setDoc(doc(db, "users", userCredential.user.uid), userData); showNotification(texts[currentLang].register_success, 'success'); switchTab({ preventDefault: () => {} }, 'login'); } catch (error) { showNotification(error.message, 'error'); } });
    resetPasswordForm.addEventListener('submit', (e) => { e.preventDefault(); const email = document.getElementById('reset-email').value; sendPasswordResetEmail(auth, email).then(() => { resetPasswordModal.classList.add('hidden'); showNotification(texts[currentLang].reset_email_sent, 'success'); }).catch((error) => { showNotification(error.message, 'error'); }); });
    
    redeemCodeButton.addEventListener('click', async () => {
        const code = promoCodeInput.value.trim().toUpperCase();
        if (!code) return;
        redeemCodeButton.disabled = true;
        redeemCodeButton.textContent = '...';
        try {
            const redeemPromoCode = httpsCallable(functions, 'redeemPromoCode');
            const result = await redeemPromoCode({ code: code });
            showNotification(result.data.message, 'success');
            currentUserData.points += result.data.pointsAdded;
            document.getElementById('user-points').textContent = currentUserData.points;
            promoCodeInput.value = '';
        } catch (error) {
            console.error("Promo kod hatası:", error);
            showNotification(error.message, 'error');
        } finally {
            redeemCodeButton.disabled = false;
            redeemCodeButton.textContent = texts[currentLang].redeem_button;
        }
    });

    updateTexts(currentLang);
});
