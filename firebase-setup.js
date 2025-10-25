// --- FIREBASE KURULUMU ve GENEL FONKSİYONLAR ---
// Bu dosya, tüm uygulamalar (index, quiz, admin) tarafından kullanılacak
// Firebase bağlantısını ve temel Auth/Firestore fonksiyonlarını içerir.

// Gerekli Firebase modüllerini içe aktarma
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously, 
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword // Admin girişi için
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    increment, 
    collection, 
    query, 
    where, 
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Hata ayıklama seviyesini ayarlama (Opsiyonel, hataları görmeyi kolaylaştırır)
setLogLevel('debug'); 

// Global Değişkenleri Yükleme
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase Uygulamasını Başlatma
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUserId = null;

// --- 1. AUTHENTICATION MANTIĞI ---

// Uygulama başlatıldığında veya kimlik doğrulama durumu değiştiğinde çağrılır
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        localStorage.setItem('currentUserId', currentUserId);

    } else {
        currentUserId = null;
        localStorage.removeItem('currentUserId');
    }
});

// Oturum Açma: Canvas token'ı veya Anonim giriş kullanır
async function initializeAuth() {
    try {
        // Eğer Canvas token'ı varsa, kullan
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            // KRİTİK DÜZELTME: Eğer URL admin.html içeriyorsa, anonim giriş yapma! 
            // Admin paneli kendi e-posta/şifre girişini kullanmalıdır.
            if (!window.location.href.includes('admin.html')) {
                await signInAnonymously(auth);
            }
        }
    } catch (error) {
        console.error("Kimlik doğrulama başlatılırken hata oluştu:", error);
    }
}

// Hemen Auth işlemini başlat
initializeAuth();

// --- 2. FIRESTORE GENEL FONKSİYONLARI ---

/**
 * Ziyaretçi sayısını artırır (Günlük tekil sayım kontrolü çağıran fonksiyonda yapılmalıdır).
 */
async function updateVisitorCount() {
    const docRef = doc(db, 'artifacts', appId, 'public/data', 'visitorCount');
    try {
        await updateDoc(docRef, {
            count: increment(1)
        });
        console.log("Ziyaretçi sayısı artırıldı.");
    } catch (e) {
        // Eğer döküman yoksa oluştur
        if (e.code === 'not-found') {
            await setDoc(docRef, { count: 1 });
            console.log("Ziyaretçi sayacı oluşturuldu ve 1 olarak ayarlandı.");
        } else {
            console.error("Ziyaretçi sayacı güncellenirken hata oluştu:", e);
        }
    }
}


/**
 * Kullanıcı kimlik doğrulama durumunu dinler (Admin script'i için dışa aktarıldı)
 * @param {function} callback - (user) => {} şeklinde bir geri çağırma fonksiyonu
 */
function listenToAuthChanges(callback) {
    return onAuthStateChanged(auth, callback);
}


// --- 3. DIŞA AKTARIMLAR (Admin paneli, index, quiz scriptleri için) ---

export { 
    db, 
    auth, 
    updateVisitorCount,
    onAuthStateChanged, 
    listenToAuthChanges, 
    signInWithEmailAndPassword, 
    signOut,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
};
