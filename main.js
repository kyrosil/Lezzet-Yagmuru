document.addEventListener('DOMContentLoaded', () => {

    // --- Element Seçimleri ---
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

    // --- Çeviri Metinleri ve Ödüller ---
    const texts = {
        tr: {
            // ... (önceki metinler aynı)
            welcome_title: "Lezzet Yağmuru'na Hoş Geldin!",
            // ...
            how_to_play: "Nasıl Oynanır & Ödüller",
            // Modal İçerikleri
            modal_title: "Nasıl Oynanır & Ödüller",
            modal_rules_title: "Oyun Kuralları",
            modal_rules_text: "CarrefourSA sepeti ile yukarıdan yağan Coca-Cola ürünlerini yakala. Farklı markalara ve bombalara dikkat et! Nestlé ürünleri sana özel güçler kazandıracak. 3 Coca-Cola şişesi kaçırırsan oyun biter.",
            modal_rewards_title: "Türkiye Ödülleri",
            rewards: [
                "<strong>500 PUAN:</strong> Coca-Cola ürünlerinde geçerli 150 TL CarrefourSA Kart Puan",
                "<strong>750 PUAN:</strong> Nestlé ürünlerinde geçerli 150 TL CarrefourSA Kart Puan",
                "<strong>1000 PUAN:</strong> Tüm ürünlerde geçerli 100 TL CarrefourSA Kart Puan",
                "<strong>1000 PUAN:</strong> Coca-Cola ürünlerinde geçerli 350 TL CarrefourSA Kart Puan",
                "<strong>1500 PUAN:</strong> Nestlé ürünlerinde geçerli 400 TL CarrefourSA Kart Puan",
                "<strong>2000 PUAN:</strong> Coca-Cola ürünlerinde geçerli 750 TL CarrefourSA Kart Puan",
                "<strong>2000 PUAN:</strong> Tüm ürünlerde geçerli 200 TL CarrefourSA Kart Puan",
                "<strong>5000 PUAN:</strong> Coca-Cola ve Nestlé ürünlerinde geçerli 2500 TL CarrefourSA Kart Puan",
                "<strong>10000 PUAN:</strong> Tüm ürünlerde geçerli 2000 TL CarrefourSA Kart Puan"
            ],
            modal_claim_title: "Ödül Nasıl Talep Edilir?",
            modal_claim_text: `Yeterli puana ulaştığında, oyun içindeki 'Ödülü Al' butonuna tıklayarak puanlarını kullanabilirsin. Puanların anında CarrefourSA kartına yüklenecektir. Yüklemenin doğrulanması için, alışveriş fişinin bir kopyasını <a href="mailto:gifts@kyrosil.eu">gifts@kyrosil.eu</a> adresine göndermen gerekmektedir.`
        },
        en: {
            // ... (önceki metinler aynı)
            welcome_title: "Welcome to Taste Rain!",
            // ...
            how_to_play: "How to Play & Prizes",
            // Modal Content
            modal_title: "How to Play & Prizes",
            modal_rules_title: "Game Rules",
            modal_rules_text: "Catch the falling Coca-Cola products with the Carrefour cart. Watch out for other brands and bombs! Nestlé products will give you special powers. The game ends if you miss 3 Coca-Cola bottles.",
            modal_rewards_title: "Europe Prizes",
            rewards: [
                "<strong>500 POINTS:</strong> 5 EURO Carrefour Card Points for Coca-Cola products",
                "<strong>750 POINTS:</strong> 7.5 EURO Carrefour Card Points for Nestlé products",
                "<strong>1000 POINTS:</strong> 5 EURO Carrefour Card Points for all products",
                "<strong>1000 POINTS:</strong> 12.5 EURO Carrefour Card Points for Coca-Cola products",
                "<strong>1500 POINTS:</strong> 17.5 EURO Carrefour Card Points for Nestlé products",
                "<strong>2000 POINTS:</strong> 30 EURO Carrefour Card Points for Coca-Cola products",
                "<strong>2000 POINTS:</strong> 12 EURO Carrefour Card Points for all products",
                "<strong>5000 POINTS:</strong> 50 EURO Carrefour Card Points for Coca-Cola and Nestlé products",
                "<strong>10,000 POINTS:</strong> 80 EURO Carrefour Card Points for all products"
            ],
            modal_claim_title: "How to Claim a Prize?",
            modal_claim_text: `When you reach enough points, you can use them by clicking the 'Claim Prize' button in the game. The points will be instantly loaded onto your Carrefour card. For verification, you must send a copy of your purchase receipt to <a href="mailto:gifts@kyrosil.eu">gifts@kyrosil.eu</a>.`
        }
    };

    // ... (diğer değişkenler ve event listenerlar aynı kalıyor)
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
        const lang = texts[currentLang];
        // Dil ve ödül listelerini doldur
        // ... (diğer metin güncellemeleri aynı kalıyor)
        document.getElementById('welcome-title').textContent = lang.welcome_title;
        // ...
        
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

        // ... (form güncellemeleri aynı kalıyor)
    }
    
    // ... (form submit fonksiyonları aynı kalıyor)

    renderAuthScreen(); // Sayfa ilk yüklendiğinde metinleri ayarla
});
