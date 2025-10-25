// admin-script.js dosyasından:
import { auth, signInWithEmailAndPassword, db, collection, getDocs, appId } from './firebase-setup.js';

// HTML elementlerinin ID'leri
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('admin-email');
const passwordInput = document.getElementById('admin-password');
const loginButton = document.getElementById('login-button'); // Buton ID'si
const errorMessageDisplay = document.getElementById('error-message'); // Hata mesajı gösterecek element ID'si

/**
 * Kullanıcıya mesaj gösterir (Hata veya Başarı)
 * Not: HTML'de 'error-message' ID'li bir elementin var olduğunu varsayar.
 * @param {string} message - Gösterilecek mesaj.
 * @param {boolean} isError - Hata olup olmadığı.
 */
function showMessage(message, isError = true) {
    if (errorMessageDisplay) {
        errorMessageDisplay.textContent = message;
        errorMessageDisplay.className = `mt-4 p-3 rounded text-center font-semibold ${isError ? 'bg-red-800 text-white' : 'bg-green-600 text-white'}`;
    } else {
        console.error("Hata mesajı görüntüleme elementi (error-message) bulunamadı:", message);
    }
}

/**
 * Admin girişi işlemini yönetir.
 */
async function handleAdminLogin(event) {
    event.preventDefault();

    // 1. Firebase Auth nesnesinin yüklendiğini kontrol et
    if (!auth || !signInWithEmailAndPassword) {
        showMessage("Hata: Firebase Auth modülleri tam yüklenemedi. setup.js dosyasını kontrol edin.", true);
        console.error("DEBUG: Firebase Auth nesnesi (auth) yüklenemedi!");
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;
    
    // UI Güncelleme
    if (loginButton) {
        loginButton.innerHTML = 'Giriş Yapılıyor...';
        loginButton.disabled = true;
    }
    showMessage("Giriş yapılıyor...", false);

    try {
        // Auth işlemi
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Başarılı giriş
        showMessage("Giriş başarılı! Admin Paneli yükleniyor...", false);
        console.log("Giriş başarılı:", userCredential.user.uid);

        // UI'ı gizle ve paneli göster (HTML'inizdeki ID'lere göre)
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-panel-content').style.display = 'block';

        // Verileri yüklemeye başla (Eğer admin.html'de veri yükleme fonksiyonunuz varsa)
        // loadAdminData(); // Bu fonksiyonu başka bir yerde tanımlamanız gerekebilir.

    } catch (error) {
        console.error("Firebase Giriş Hatası:", error);

        // Butonu eski haline getir
        if (loginButton) {
            loginButton.innerHTML = 'Giriş Yap';
            loginButton.disabled = false;
        }

        let userMessage = "Giriş başarısız oldu. Lütfen e-posta ve şifrenizi kontrol edin.";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            userMessage = "E-posta veya şifre hatalı.";
        } else if (error.code === 'auth/invalid-email') {
            userMessage = "Geçersiz e-posta formatı.";
        } else if (error.code === 'auth/network-request-failed') {
            userMessage = "Ağ bağlantı hatası. İnternet bağlantınızı kontrol edin.";
        } else if (error.code === 'auth/unauthorized-domain') {
            userMessage = "Firebase Auth, bu alan adından gelen isteklere izin vermiyor. Proje ayarlarını kontrol edin.";
        }
        
        showMessage(`Giriş Hatası: ${userMessage}`, true);
    }
}

// Giriş formuna dinleyici ekleme
document.addEventListener('DOMContentLoaded', () => {
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    } else if (loginButton) {
        // Eğer form yoksa, butona direkt dinleyici ekleyelim
        loginButton.addEventListener('click', handleAdminLogin);
    } else {
        console.error("Hata: Admin panelinde ne 'login-form' ne de 'login-button' ID'li element bulundu. Lütfen ID'leri kontrol edin.");
    }
});
