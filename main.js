import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js";

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
    const screens = { langSelect: document.getElementById('language-selector-screen'), auth: document.getElementById('auth-screen'), mainMenu: document.getElementById('main-menu-screen'), rewardsMarket: document.getElementById('rewards-market-screen'), myPurchases: document.getElementById('my-purchases-screen') };
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
            purchases_title: "Satın Alımlarım", no_purchases: "Henüz bir satın alım yapmadınız.", inceleniyor: "İnceleniyor", tanımlandı: "Tanımlandı", loading: "Yükleniyor...", promo_title: "Promosyon Kodu", redeem_button: "Kullan"
        },
        en: {
            // ... (İngilizce metinler de benzer şekilde güncellendi)
        }
    };
    
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
            } else { console.error("User data not found in Firestore!"); signOut(auth); }
        } else {
            showScreen('langSelect');
        }
    });

    function showScreen(screenNameKey) { Object.values(screens).forEach(screen => { if (screen) screen.classList.add('hidden'); }); if (screens[screenNameKey]) screens[screenNameKey].classList.remove('hidden'); }
    function showNotification(message, type = 'error', target = notificationMessage) { target.innerHTML = message; target.className = `notification ${type}`; setTimeout(() => { target.className = 'notification hidden'; }, 10000); }
    
    function updateTexts(lang) { /* ... Önceki tam updateTexts fonksiyonu ... */ }
    function handleSelection(selection) { /* ... Önceki tam handleSelection fonksiyonu ... */ }
    function switchTab(event, tabName) { /* ... Önceki tam switchTab fonksiyonu ... */ }
    
    function renderRewardsMarket() {
        const rewardsListEl = document.getElementById('rewards-list');
        rewardsListEl.innerHTML = '';
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

    // --- Olay Yöneticileri ---
    selectTR.addEventListener('click', () => handleSelection('tr'));
    selectEU.addEventListener('click', () => handleSelection('en'));
    // ... diğer tüm olay yöneticileri ...
    
    // Form Gönderme Olayları
    loginForm.addEventListener('submit', (e) => { /* ... */ });
    registerForm.addEventListener('submit', async (e) => { /* ... */ });
    resetPasswordForm.addEventListener('submit', (e) => { /* ... */ });
    
    redeemCodeButton.addEventListener('click', async () => {
        const code = promoCodeInput.value.trim().toUpperCase();
        if (!code) return;
        redeemCodeButton.disabled = true;
        redeemCodeButton.textContent = '...';
        try {
            const redeemPromoCode = httpsCallable(functions, 'redeemPromoCode');
            const result = await redeemPromoCode({ code: code });
            showNotification(result.data.message, 'success', notificationMessage);
            currentUserData.points += result.data.pointsAdded;
            document.getElementById('user-points').textContent = currentUserData.points;
            promoCodeInput.value = '';
        } catch (error) {
            console.error("Promo kod hatası:", error);
            showNotification(error.message, 'error', notificationMessage);
        } finally {
            redeemCodeButton.disabled = false;
            redeemCodeButton.textContent = texts[currentLang].redeem_button;
        }
    });

    updateTexts(currentLang);
});
