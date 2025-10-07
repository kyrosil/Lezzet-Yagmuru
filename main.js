document.addEventListener('DOMContentLoaded', () => {

    // Dil seçimi elementleri
    const selectTR = document.getElementById('select-tr');
    const selectEU = document.getElementById('select-eu');
    const langContainer = document.querySelector('.language-selector-container');
    
    // Üyelik ekranı elementleri
    const authScreen = document.getElementById('auth-screen');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const countryWrapper = document.getElementById('country-wrapper');
    const followLabel = document.getElementById('follow-label');

    // Çeviri metinleri objesi
    const texts = {
        tr: {
            login: "Giriş Yap",
            register: "Kayıt Ol",
            email_placeholder: "E-posta Adresi",
            password_placeholder: "Şifre",
            social_placeholder: "Sosyal Medya Kullanıcı Adı",
            follow_text: "@Kyrosil hesabını takip ediyorum.",
            sponsors_text: "Sponsorlarımız",
        },
        en: {
            login: "Login",
            register: "Sign Up",
            email_placeholder: "Email Address",
            password_placeholder: "Password",
            social_placeholder: "Social Media Username",
            follow_text: "I am following the @Kyrosil account.",
            sponsors_text: "Our Sponsors",
        }
    };

    let currentLang = 'tr'; // Varsayılan dil

    // --- Dil Seçimi Yönetimi ---
    selectTR.addEventListener('click', () => handleSelection('tr'));
    selectEU.addEventListener('click', () => handleSelection('eu'));

    function handleSelection(selection) {
        currentLang = selection;
        langContainer.classList.add('fade-out');
        setTimeout(() => {
            langContainer.classList.add('hidden');
            authScreen.classList.remove('hidden');
            renderAuthScreen();
        }, 300);
    }

    // --- Üyelik Ekranı Yönetimi ---
    function renderAuthScreen() {
        const langTexts = texts[currentLang];
        // Metinleri dile göre güncelle
        loginTab.textContent = langTexts.login;
        registerTab.textContent = langTexts.register;
        document.getElementById('login-email').placeholder = langTexts.email_placeholder;
        document.getElementById('login-password').placeholder = langTexts.password_placeholder;
        document.getElementById('login-button').textContent = langTexts.login;
        document.getElementById('register-email').placeholder = langTexts.email_placeholder;
        document.getElementById('register-password').placeholder = langTexts.password_placeholder;
        document.getElementById('register-social').placeholder = langTexts.social_placeholder;
        followLabel.textContent = langTexts.follow_text;
        document.getElementById('register-button').textContent = langTexts.register;
        document.getElementById('sponsors-text').textContent = langTexts.sponsors_text;
        
        // Avrupa seçildiyse ülke listesini göster
        if (currentLang === 'eu') {
            countryWrapper.classList.remove('hidden');
        } else {
            countryWrapper.classList.add('hidden');
        }
    }

    // Tab geçişleri
    loginTab.addEventListener('click', (e) => {
        e.preventDefault();
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', (e) => {
        e.preventDefault();
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Form gönderme işlemleri (şimdilik sadece verileri konsola yazdır)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Giriş Yapma Talebi:");
        console.log("E-posta:", document.getElementById('login-email').value);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            email: document.getElementById('register-email').value,
            social: document.getElementById('register-social').value,
            isFollowing: document.getElementById('follow-confirm').checked,
        };
        if (currentLang === 'eu') {
            userData.country = document.getElementById('register-country').value;
        }
        console.log("Kayıt Olma Talebi (Firebase'e gidecek veriler):", userData);
    });
});
