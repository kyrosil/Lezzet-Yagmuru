// GÜNCEL KOD: Firebase'in yeni versiyonu için gerekli fonksiyonları import ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Senin son yolladığın, doğru Firebase projenin kimlik bilgileri.
const firebaseConfig = {
  apiKey: "AIzaSyDAlIpvrMtKbfOJmTo1Ut4H3lV3KMePQZo",
  authDomain: "lezzet-yagmuru.firebaseapp.com",
  projectId: "lezzet-yagmuru",
  storageBucket: "lezzet-yagmuru.appspot.com", // 'firebasestorage.app' değil, '.appspot.com' olmalı. Düzeltildi.
  messagingSenderId: "435103121551",
  appId: "1:435103121551:web:3ad5ce4a45b557e026f0fa",
  measurementId: "G-805ZG6M5VK"
};

// Firebase'i ve servisleri yeni yöntemle başlat
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);

// DOMContentLoaded olayı, tüm HTML'in yüklenmesini bekler
document.addEventListener('DOMContentLoaded', () => {
    // --- Element Seçimleri ---
    const langContainer = document.querySelector('.language-selector-container');
    const authScreen = document.getElementById('auth-screen');
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
    
    // --- ÇEVİRİ METİNLERİ VE VERİLER ---
    const texts = {
        tr: {
            carrefour_logo_url: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1",
            lang_select_title: "Konumunu Seç",
            location_warning: "<strong>ÖNEMLİ:</strong> Ödüllerin doğru bir şekilde tanımlanabilmesi için lütfen yaşadığınız bölgeyi doğru seçiniz. Bu seçim daha sonra değiştirilemez.",
            welcome_title: "Lezzet Yağmuru'na Hoş Geldin!",
            login: "Giriş Yap", register: "Kayıt Ol", email_placeholder: "E-posta Adresi", password_placeholder: "Şifre", social_placeholder: "Sosyal Medya Kullanıcı Adı", card_gsm_placeholder: "CarrefourSA Kart No / GSM No",
            card_info: `Kartınız yok mu? <a href="https://www.carrefoursakart.com/" target="_blank">Hemen oluşturun!</a>`,
            follow_text: "@Kyrosil hesabını takip ediyorum.", how_to_play: "Nasıl Oynanır & Ödüller", modal_title: "Nasıl Oynanır & Ödüller", modal_rules_title: "Oyun Kuralları",
            modal_rules_text: "CarrefourSA sepeti ile yukarıdan yağan Coca-Cola ürünlerini yakala. Farklı markalara ve bombalara dikkat et! Nestlé ürünleri sana özel güçler kazandıracak. 3 Coca-Cola şişesi kaçırırsan oyun biter.",
            modal_rewards_title: "Türkiye Ödülleri",
            rewards: ["<strong>500 PUAN:</strong> Coca-Cola ürünlerinde 150 TL Puan","<strong>750 PUAN:</strong> Nestlé ürünlerinde 150 TL Puan","<strong>1000 PUAN:</strong> Tüm ürünlerde 100 TL Puan","<strong>1000 PUAN:</strong> Coca-Cola ürünlerinde 350 TL Puan","<strong>1500 PUAN:</strong> Nestlé ürünlerinde 400 TL Puan","<strong>2000 PUAN:</strong> Coca-Cola ürünlerinde 750 TL Puan","<strong>2000 PUAN:</strong> Tüm ürünlerde 200 TL Puan","<strong>5000 PUAN:</strong> Coca-Cola ve Nestlé ürünlerinde 2500 TL Puan","<strong>10000 PUAN:</strong> Tüm ürünlerde 2000 TL Puan"],
            modal_claim_title: "Ödül Nasıl Talep Edilir?",
            modal_claim_text: `Yeterli puana ulaştığında, oyun içindeki 'Ödülü Al' butonuna tıklayarak puanlarını kullanabilirsin. Puanların anında CarrefourSA kartına yüklenecektir. Yüklemenin doğrulanması için, alışveriş fişinin bir kopyasını <a href="mailto:gifts@kyrosil.eu">gifts@kyrosil.eu</a> adresine göndermen gerekmektedir.`
        },
        en: {
            carrefour_logo_url: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1",
            lang_select_title: "Select Your Location",
            location_warning: "<strong>IMPORTANT:</strong> To ensure correct prize allocation, please select the region you live in. This selection cannot be changed later.",
            welcome_title: "Welcome to Taste Rain!",
            login: "Login", register: "Sign Up", email_placeholder: "Email Address", password_placeholder: "Password", social_placeholder: "Social Media Username", card_gsm_placeholder: "Carrefour Card No / Mobile No",
            card_info: "If you don't have a card, enter your mobile number. You will need to create a card in-store to claim your prize.",
            follow_text: "I am following the @Kyrosil account.", how_to_play: "How to Play & Prizes", modal_title: "How to Play & Prizes", modal_rules_title: "Game Rules",
            modal_rules_text: "Catch the falling Coca-Cola products with the Carrefour cart. Watch out for other brands and bombs! Nestlé products will give you special powers. The game ends if you miss 3 Coca-Cola bottles.",
            modal_rewards_title: "Europe Prizes",
            rewards: ["<strong>500 PTS:</strong> 5€ Points for Coca-Cola products","<strong>750 PTS:</strong> 7.5€ Points for Nestlé products","<strong>1000 PTS:</strong> 5€ Points for all products","<strong>1000 PTS:</strong> 12.5€ Points for Coca-Cola products","<strong>1500 PTS:</strong> 17.5€ Points for Nestlé products","<strong>2000 PTS:</strong> 30€ Points for Coca-Cola products","<strong>2000 PTS:</strong> 12€ Points for all products","<strong>5000 PTS:</strong> 50€ Points for Coca-Cola & Nestlé products","<strong>10,000 PTS:</strong> 80€ Points for all products"],
            modal_claim_title: "How to Claim a Prize?",
            modal_claim_text: `When you reach enough points, you can use them by clicking the 'Claim Prize' button in the game. The points will be instantly loaded onto your Carrefour card. For verification, you must send a copy of your purchase receipt to <a href="mailto:gifts@kyrosil.eu">gifts@kyrosil.eu</a>.`
        }
    };
    
    let currentLang = 'tr';

    function updateTexts(lang) {
        const langData = texts[lang];
        if (!langData) { console.error("Dil verisi bulunamadı:", lang); return; }
        
        // DİNAMİK 'REQUIRED' DÜZELTMESİ BURADA
        countrySelect.required = (lang === 'en');

        document.getElementById('lang-select-title').textContent = langData.lang_select_title;
        // ... Diğer tüm text atamaları aynı kalacak
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
        document.getElementById('modal-title').textContent = langData.modal_title;
        document.getElementById('modal-rules-title').textContent = langData.modal_rules_title;
        document.getElementById('modal-rules-text').textContent = langData.modal_rules_text;
        document.getElementById('modal-rewards-title').textContent = langData.modal_rewards_title;
        const rewardsList = langData.rewards.map(reward => `<li>${reward}</li>`).join('');
        document.getElementById('modal-rewards-text').innerHTML = `<ul>${rewardsList}</ul>`;
        document.getElementById('modal-claim-title').textContent = langData.modal_claim_title;
        document.getElementById('modal-claim-text').innerHTML = langData.modal_claim_text;
        
        countryWrapper.classList.toggle('hidden', lang !== 'en');
    }

    function handleSelection(selection) {
        currentLang = selection;
        updateTexts(currentLang);
        langContainer.classList.add('fade-out');
        setTimeout(() => {
            langContainer.classList.add('hidden');
            authScreen.classList.remove('hidden');
        }, 300);
    }
    
    function switchTab(event, tabName) {
        event.preventDefault();
        const isLogin = tabName === 'login';
        loginTab.classList.toggle('active', isLogin);
        registerTab.classList.toggle('active', !isLogin);
        loginForm.classList.toggle('hidden', !isLogin);
        registerForm.classList.toggle('hidden', isLogin);
    }
    
    // --- Olay Yöneticileri ---
    selectTR.addEventListener('click', () => handleSelection('tr'));
    selectEU.addEventListener('click', () => handleSelection('en'));
    loginTab.addEventListener('click', (e) => switchTab(e, 'login'));
    registerTab.addEventListener('click', (e) => switchTab(e, 'register'));
    howToPlayLink.addEventListener('click', (e) => { e.preventDefault(); infoModal.classList.remove('hidden'); });
    modalCloseButton.addEventListener('click', () => infoModal.classList.add('hidden'));

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Giriş başarılı:", userCredential.user);
                alert("Giriş başarılı! Ana menüye yönlendiriliyorsunuz...");
                // BURASI BİZİ ANA MENÜYE GÖTÜRECEK
            })
            .catch((error) => {
                console.error("Giriş hatası:", error);
                alert("Giriş başarısız oldu. Hata: " + error.message);
            });
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const userData = {
            social: document.getElementById('register-social').value,
            card_gsm: document.getElementById('register-card-gsm').value,
            isFollowing: document.getElementById('follow-confirm').checked,
            region: currentLang,
            points: 0,
            createdAt: serverTimestamp()
        };
        if (currentLang === 'en') {
            userData.country = countrySelect.value;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), userData);
            
            console.log("Kullanıcı veritabanına başarıyla kaydedildi.");
            alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
            switchTab({ preventDefault: () => {} }, 'login');
        } catch (error) {
            console.error("Kayıt hatası:", error);
            alert("Kayıt işlemi başarısız oldu. Hata: " + error.message);
        }
    });

    updateTexts(currentLang);
});
