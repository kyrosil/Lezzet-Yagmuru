// DOM yüklendiğinde kodun çalışmasını sağla
document.addEventListener('DOMContentLoaded', () => {

    // Gerekli HTML elementlerini seç
    const selectTR = document.getElementById('select-tr');
    const selectEU = document.getElementById('select-eu');
    const langContainer = document.querySelector('.language-selector-container');
    const authScreen = document.getElementById('auth-screen');

    // Türkiye seçeneğine tıklanırsa
    selectTR.addEventListener('click', () => {
        handleSelection('tr');
    });

    // Avrupa seçeneğine tıklanırsa
    selectEU.addEventListener('click', () => {
        handleSelection('eu');
    });

    function handleSelection(selection) {
        console.log(`Bölge seçildi: ${selection}`);
        
        // Seçim yapıldıktan sonra dil seçim ekranını yavaşça kaybet
        langContainer.classList.add('fade-out');

        // Animasyon bittikten sonra üyelik ekranını göster
        setTimeout(() => {
            langContainer.classList.add('hidden'); // Tamamen gizle
            
            // Buraya bir sonraki adım olan üyelik ekranını getireceğiz
            authScreen.classList.remove('hidden');
            authScreen.innerHTML = `<h1>Üyelik Ekranı (${selection === 'tr' ? 'Türkçe' : 'English'})</h1><p>Bu ekran hazırlanıyor...</p>`;
            console.log("Üyelik ekranı gösteriliyor...");

        }, 300); // 300 milisaniye (CSS'teki transition ile aynı süre)
    }

});
