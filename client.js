document.addEventListener('DOMContentLoaded', () => {
    // Sayacın görüntüleneceği HTML elementini bul
    const visitorCountElement = document.getElementById('visitor-count');

    // Eğer element yoksa (örneğin admin sayfasındaysak), işlemi durdur.
    if (!visitorCountElement) {
        // console.log("Sayaç elementi bulunamadı, bu normal bir durum olabilir.");
        return; 
    }

    // Sunucudan ziyaretçi sayısını al ve artır
    fetch("https://cybersecurityweb.onrender.com/visitors")
        .then(response => {
            if (!response.ok) {
                // HTTP hatası durumunda hata fırlat
                throw new Error(`HTTP hata kodu: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Sayıyı ekrana yazdır
            visitorCountElement.textContent = data.count;
        })
        .catch(error => {
            console.error('Ziyaretçi sayısı alınamadı veya sunucu hatası:', error);
            visitorCountElement.textContent = 'Hata (Sunucuya Erişilemiyor)';
        });
});