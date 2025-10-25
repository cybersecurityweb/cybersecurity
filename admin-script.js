import { 
    auth, 
    db, 
    appId,
    collection, 
    query, 
    getDocs, 
    where, 
    doc,
    deleteDoc,
    signInWithEmailAndPassword 
} from './firebase-setup.js';

// --- Yardımcı Fonksiyonlar (Hata Mesajı Gösterme) ---

/**
 * Kullanıcıya ekranın ortasında bir hata mesajı gösterir.
 * @param {string} message - Gösterilecek hata mesajı
 */
function showErrorMessage(message) {
    let errorBox = document.getElementById('error-message-box');
    if (!errorBox) {
        errorBox = document.createElement('div');
        errorBox.id = 'error-message-box';
        errorBox.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
        errorBox.innerHTML = `
            <div class="bg-red-800 text-white p-6 rounded-lg shadow-2xl max-w-sm text-center transform transition-all duration-300 scale-100">
                <h3 class="text-xl font-bold mb-4">Hata</h3>
                <p id="error-text">${message}</p>
                <button onclick="document.getElementById('error-message-box').remove()" class="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200">Kapat</button>
            </div>
        `;
        document.body.appendChild(errorBox);
        document.getElementById('error-text').textContent = message;
    } else {
        document.getElementById('error-text').textContent = message;
        errorBox.style.display = 'flex';
    }
}

// Admin Girişini Yöneten Fonksiyon
async function handleAdminLogin() {
    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const loginButton = document.getElementById('login-button');

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';
    
    // Yükleniyor durumunu ayarla
    loginButton.innerHTML = `<span class="loading-spin"></span> Giriş Yapılıyor...`;
    loginButton.disabled = true;

    if (!auth) {
        showErrorMessage('Hata: Firebase Auth hizmeti başlatılamadı. Yapılandırmayı kontrol edin.');
        loginButton.innerHTML = `Giriş Yap`;
        loginButton.disabled = false;
        return;
    }

    try {
        // Firebase Auth ile giriş yapma denemesi
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Giriş başarılı:", userCredential.user.uid);
        
        // Başarılı girişte paneli göster (HTML'inizdeki ID'lere göre ayarlanmalı)
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-panel-content').style.display = 'block';

        // Verileri yüklemeye başla
        await loadFromFirebase();

    } catch (error) {
        console.error("Firebase Giriş Hatası:", error);
        loginButton.innerHTML = `Giriş Yap`;
        loginButton.disabled = false;

        let userMessage = 'Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.';

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            userMessage = 'E-posta veya şifre hatalı.';
        } else if (error.code === 'auth/missing-api-key') {
            userMessage = 'Hata: Firebase API anahtarı eksik. Yapılandırmayı kontrol edin.';
        }

        showErrorMessage(`Giriş Hatası: ${userMessage}`);
    }
}

// --- Firebase Veri Yükleme ---

async function loadFromFirebase() {
    console.log("Firebase'den veriler yükleniyor...");

    // Verilerinizin bulunduğu varsayılan yolu kullanıyoruz
    const collectionPath = `artifacts/${appId}/public/data/veliler`;
    const velilerRef = collection(db, collectionPath);
    
    try {
        const snapshot = await getDocs(velilerRef);
        const veliList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`Yüklendi: ${veliList.length} veli verisi.`);
        
        // Buradan sonra paneli verilerle doldurma fonksiyonlarınız çağrılmalıdır.
        // Örneğin: renderAdminPanel(veliList);

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        showErrorMessage("Veri yüklenirken bir hata oluştu. Lütfen Firestore Güvenlik kurallarınızı ve Admin yetkinizi kontrol edin.");
    }
}

// --- Event Listener'lar ---

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', handleAdminLogin);
    }
});