document.addEventListener('DOMContentLoaded', () => {

    // --- Element Seçimleri ---
    // Diğer element seçimleri aynı
    const carrefourLogo = document.getElementById('carrefour-logo');

    // --- Çeviri Metinleri ve Ödüller ---
    const texts = {
        tr: {
            // YENİ: CarrefourSA logosu eklendi
            carrefour_logo_url: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-16.png?ssl=1",
            // Diğer tüm metinler ve ödüller aynı
            welcome_title: "Lezzet Yağmuru'na Hoş Geldin!",
            // ...
        },
        en: {
            // YENİ: Uluslararası Carrefour logosu eklendi
            carrefour_logo_url: "https://i0.wp.com/kyrosil.wpcomstaging.com/wp-content/uploads/2025/04/image-17.png?ssl=1",
            // Diğer tüm metinler ve ödüller aynı
            welcome_title: "Welcome to Taste Rain!",
            // ...
        }
    };

    // ... Diğer tüm fonksiyonlar ve event listener'lar aynı ...

    function renderAuthScreen() {
        const lang = texts[currentLang];
        
        // YENİ: Doğru Carrefour logosunu ayarla
        carrefourLogo.src = lang.carrefour_logo_url;
        
        // Diğer tüm metin güncellemeleri eskisi gibi devam ediyor
        // ...
        document.getElementById('welcome-title').textContent = lang.welcome_title;
        // ...

        // ... Modal içeriğini doldurma işlemleri de aynı ...
    }
    
    // ... Geri kalan tüm kodlar aynı ...
    // Tüm fonksiyonları eksiksiz olarak kopyalamak için aşağıya tam kodu ekliyorum
    
    const selectTR = document.getElementById('select-tr');
    const selectEU = document.getElementById('select-eu');
    const langContainer = document.querySelector('.language-selector-container');
    const authScreen = document.getElementById('auth-screen');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const countryWrapper = document.getElementById('country-wrapper');
    const cardInfoText = document.getElementById('card-info-text');
    const howToPlayLink = document.getElementById('how-to-play-link');
    const infoModal = document.getElementById('info-modal');
    const modalCloseButton = document.getElementById('modal-close-button');

    let currentLang = 'tr';
    
    selectTR.addEventListener('click', () => handleSelection('tr'));
    selectEU.addEventListener('click', () => handleSelection('eu'));
    loginTab.addEventListener('click', (e) => switchTab(e, 'login'));
    registerTab.addEventListener('click', (e) => switchTab(e, 'register'));
    howToPlayLink.addEventListener('click', (e) => { e.preventDefault(); infoModal.classList.remove('hidden'); });
    modalCloseButton.addEventListener('click', () => infoModal.classList.add('hidden'));

    function handleSelection(selection) {
        currentLang = selection;
        langContainer.classList.add('fade-out');
        setTimeout(() => {
            langContainer.classList.add('hidden');
            authScreen.classList.remove('hidden');
            renderAuthScreen();
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

    function renderAuthScreen() {
        const langData = texts[currentLang];
        const lang = { ...texts.tr, ...langData }; // Önce TR'yi yükle, sonra seçili dille üzerine yaz. Ödüller gibi ortak alanlar için.
        
        // DİNAMİK LOGO GÜNCELLEMESİ
        carrefourLogo.src = lang.carrefour_logo_url;
        
        // Tüm metinleri seçilen dile göre güncelle
        document.getElementById('location-warning-text').innerHTML = lang.location_warning;
        document.getElementById('welcome-title').textContent = lang.welcome_title;
        loginTab.textContent = lang.login;
        registerTab.textContent = lang.register;
        document.getElementById('login-email').placeholder = lang.email_placeholder;
        document.getElementById('login-password').placeholder = lang.password_placeholder;
        document.getElementById('login-button').textContent = lang.login;
        document.getElementById('register-email').placeholder = lang.email_placeholder;
        document.getElementById('register-password').placeholder = lang.password_placeholder;
        document.getElementById('register-social').placeholder = lang.social_placeholder;
        document.getElementById('register-card-gsm').placeholder = lang.card_gsm_placeholder;
        cardInfoText.innerHTML = lang.card_info;
        document.getElementById('follow-label').textContent = lang.follow_text;
        document.getElementById('register-button').textContent = lang.register;
        howToPlayLink.textContent = lang.how_to_play;

        // Modal içeriğini doldur
        document.getElementById('modal-title').textContent = lang.modal_title;
        document.getElementById('modal-rules-title').textContent = lang.modal_rules_title;
        document.getElementById('modal-rules-text').textContent = lang.modal_rules_text;
        document.getElementById('modal-rewards-title').textContent = lang.modal_rewards_title;

        // Ödül listesini oluştur
        const rewardsList = lang.rewards.map(reward => `<li>${reward}</li>`).join('');
        document.getElementById('modal-rewards-text').innerHTML = `<ul>${rewardsList}</ul>`;
        
        document.getElementById('modal-claim-title').textContent = lang.modal_claim_title;
        document.getElementById('modal-claim-text').innerHTML = lang.modal_claim_text;
        
        countryWrapper.classList.toggle('hidden', currentLang !== 'eu');
    }
    
    loginForm.addEventListener('submit', (e) => { e.preventDefault(); console.log("Giriş Yapma Talebi:", { email: document.getElementById('login-email').value }); });
    registerForm.addEventListener('submit', (e) => { e.preventDefault(); const userData = { email: document.getElementById('register-email').value, social: document.getElementById('register-social').value, card_gsm: document.getElementById('register-card-gsm').value, isFollowing: document.getElementById('follow-confirm').checked, region: currentLang }; if (currentLang === 'eu') { userData.country = document.getElementById('register-country').value; } console.log("Kayıt Olma Talebi (Firebase'e gidecek veriler):", userData); });
    
    renderAuthScreen();
});
