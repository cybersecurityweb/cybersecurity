<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const visitorCountElement = document.getElementById('visitor-count');

    // Sunucudan ziyaretçi sayısını al
    fetch("https://cybersecurityweb.onrender.com/visitors")
        .then(response => response.json())
        .then(data => {
            // Sayıyı ekrana yazdır
            visitorCountElement.textContent = data.count;
        })
        .catch(error => {
            console.error('Ziyaretçi sayısı alınamadı:', error);
            visitorCountElement.textContent = 'Hata';
        });
=======
document.addEventListener('DOMContentLoaded', () => {
    const visitorCountElement = document.getElementById('visitor-count');

    // Sunucudan ziyaretçi sayısını al
    fetch("https://cybersecurityweb.onrender.com/visitors")
        .then(response => response.json())
        .then(data => {
            // Sayıyı ekrana yazdır
            visitorCountElement.textContent = data.count;
        })
        .catch(error => {
            console.error('Ziyaretçi sayısı alınamadı:', error);
            visitorCountElement.textContent = 'Hata';
        });
>>>>>>> 89b5b77 (Son sayaç ve quiz düzeltmeleri.)
});