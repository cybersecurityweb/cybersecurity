// admin-script.js dosyasından: Bu dosya, admin girişi ve Firebase'den istatistik çekme işlemini yönetir.

// TÜM GEREKLİ MODÜLLER TEK BİR YERDEN, firebase-setup.js'DEN ALINIYOR
import { 
    auth, 
    db, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    collection, 
    getDocs,
    query,
    where
} from './firebase-setup.js';

// HTML Elementleri (admin.html dosyasındaki ID'ler ile %100 uyumlu olmalıdır)
const loginForm = document.getElementById('login-form');
const adminEmail = document.getElementById('admin-email');
const adminPassword = document.getElementById('admin-password');
const loginButton = document.getElementById('login-button'); 
const errorMessageDisplay = document.getElementById('error-message'); 

// Admin Panel İçeriği
const loginContainer = document.getElementById('login-container');
const adminPanelContent = document.getElementById('admin-panel-content');
const statsContent = document.getElementById('stats-content');
const logoutBtn = document.getElementById('logout-btn');


/**
 * Hata veya bilgi mesajlarını gösterir.
 * @param {string} message - Gösterilecek mesaj.
 * @param {boolean} isError - Hata olup olmadığı (true = kırmızı, false = yeşil).
 */
function showMessage(message, isError = true) {
    if (errorMessageDisplay) {
        errorMessageDisplay.textContent = message;
        errorMessageDisplay.style.display = 'block';
        // Tailwind CSS sınıflarını güncelleyerek rengini ayarlar
        errorMessageDisplay.className = `mt-4 p-3 rounded text-center font-semibold ${isError ? 'bg-red-800 text-white' : 'bg-green-600 text-white'}`;
    } else {
        console.error("Hata mesajı görüntüleme elementi (error-message) bulunamadı:", message);
    }
}


// Veritabanından İstatistikleri Çekme ve Hesaplama
async function fetchStats() {
    if (statsContent) statsContent.innerHTML = 'İstatistikler yükleniyor...';
    
    if (!auth || !db) {
        if (statsContent) statsContent.innerHTML = '<p class="text-red-500">Firebase Auth/DB Başlatılamadı.</p>';
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, "test_results"));
        
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push(doc.data());
        });
        
        displayStats(results); 
        
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        if (statsContent) statsContent.innerHTML = '<p class="text-red-500">Veri çekilirken bir hata oluştu. Güvenlik kurallarını kontrol edin.</p>';
    }
}


// İstatistikleri Ekranda Gösterme
function displayStats(results) {
    if (!statsContent) return;

    if (results.length === 0) {
        statsContent.innerHTML = '<p class="text-gray-500">Henüz hiçbir test sonucu kaydedilmemiş.</p>';
        return;
    }
    
    const totalTests = results.length;
    let totalScoreSum = 0;

    results.forEach(result => {
        totalScoreSum += result.totalScore || 0; 
    });

    const averageScore = (totalScoreSum / totalTests).toFixed(2);
    const maxScore = 49; // 7 soru * 7 puan
    
    statsContent.innerHTML = `
        <div class="space-y-4">
            <h3 class="text-xl font-bold border-b pb-2">Genel Bakış</h3>
            <p><strong>Toplam Yapılan Test Sayısı:</strong> ${totalTests}</p>
            <p><strong>Ortalama Puan:</strong> ${averageScore} / ${maxScore}</p>
            
            <h3 class="text-xl font-bold border-b pb-2 pt-6">Tüm Kayıtlar</h3>
            <ul class="space-y-2">
                ${results.map(r => {
                    const date = r.timestamp && r.timestamp.seconds 
                        ? new Date(r.timestamp.seconds * 1000).toLocaleString('tr-TR') 
                        : 'Yükleniyor';
                    return `
                        <li class="border-b border-gray-200 pb-2">
                            <span class="font-semibold text-lg text-blue-400">Puan: ${r.totalScore || 'N/A'}</span> 
                            <span class="text-gray-500">(Tarih: ${date})</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        </div>
    `;
}

/**
 * Admin Giriş İşlemi
 */
async function handleAdminLogin(email, password) {
    if (!loginButton) return;

    loginButton.innerHTML = 'Giriş Yapılıyor...';
    loginButton.disabled = true;
    showMessage("Giriş yapılıyor...", false);
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // Başarılı girişten sonra onAuthStateChanged tetiklenecektir.
    } catch (error) {
        console.error("Firebase Giriş Hatası:", error);

        loginButton.innerHTML = 'Giriş Yap';
        loginButton.disabled = false;

        let userMessage = "Giriş başarısız oldu. Lütfen e-posta ve şifrenizi kontrol edin.";
        
        // Firebase Auth Hata Kodları Kontrolü
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            userMessage = "E-posta veya şifre hatalı.";
        } else if (error.code === 'auth/invalid-email') {
             userMessage = "Geçersiz e-posta formatı.";
        }
        
        showMessage(`Hata: ${userMessage}`, true);
    }
}


// Çıkış İşlemi
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        if(auth) await signOut(auth);
        showMessage("Başarıyla çıkış yapıldı. Lütfen tekrar giriş yapın.", false);
    });
}


// Kimlik Doğrulama Durumu Değiştiğinde (Ana Uygulama Akışı)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Durumu Dinleyicisi
    if (auth) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // Giriş Başarılı
                if (loginContainer) loginContainer.style.display = 'none';
                if (adminPanelContent) adminPanelContent.style.display = 'block';
                const userEmail = user.email || 'Bilinmeyen Kullanıcı';
                showMessage(`Hoş geldiniz, Admin (${userEmail})!`, false);
                fetchStats(); 
            } else {
                // Çıkış Yapıldı
                if (loginContainer) loginContainer.style.display = 'block';
                if (adminPanelContent) adminPanelContent.style.display = 'none';
                if (statsContent) statsContent.innerHTML = '<p class="text-gray-500">İstatistikleri görmek için lütfen giriş yapın.</p>';
                showMessage('Lütfen giriş yapın.', false);
            }
            // Buton durumunu sıfırla
            if (loginButton) {
                loginButton.innerHTML = 'Giriş Yap';
                loginButton.disabled = false;
            }
        });
    } else {
        showMessage("KRİTİK HATA: Firebase Auth nesnesi yüklenemedi. 'firebase-setup.js' dosyasını kontrol edin.", true);
    }
    
    // 2. Giriş Formu Dinleyicisi
    const submitHandler = (e) => {
        e.preventDefault();
        const email = adminEmail ? adminEmail.value : '';
        const password = adminPassword ? adminPassword.value : '';
        
        if (!email || !password) {
            showMessage("Lütfen e-posta ve şifrenizi giriniz.", true);
            return;
        }

        handleAdminLogin(email, password);
    };

    // Formu dinleme (Form submit edildiğinde)
    if (loginForm) {
        loginForm.addEventListener('submit', submitHandler);
    } else {
        console.error("HATA: Admin panelinde giriş formu (login-form) bulunamadı. admin.html dosyasını kontrol edin.");
        // Eğer form yoksa ve sadece butona güveniyorsak:
        if (loginButton) {
            loginButton.addEventListener('click', (e) => { e.preventDefault(); submitHandler(e); });
        } else {
            showMessage("KRİTİK HATA: Giriş elementleri HTML'de bulunamadı. ID'leri kontrol edin.", true);
        }
    }
});
