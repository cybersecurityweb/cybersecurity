// --- FIREBASE KURULUMU ve GENEL FONKSİYONLAR ---
// Bu versiyon, Canvas ortamından bağımsız olarak çalışır ve
// Firebase konfigürasyonunu doğrudan kullanır.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
    getAuth, 
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

// Hata ayıklama seviyesini ayarlama (Opsiyonel)
setLogLevel('debug'); 

// --- KRİTİK: BURAYI KENDİ BİLGİLERİNİZLE DEĞİŞTİRİN ---
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdkl1ZV3f2opyXwcNFbEZHRvWcSTgLLJ4",
  authDomain: "cybersecurity-test-analytics.firebaseapp.com",
  projectId: "cybersecurity-test-analytics",
  storageBucket: "cybersecurity-test-analytics.firebasestorage.app",
  messagingSenderId: "1070203500987",
  appId: "1:1070203500987:web:0a3b257a0fabcb3ff02c9e",
  measurementId: "G-HBSRZWSKJ2"
};

// Initialize Firebase
// --- KRİTİK SONU ---

// Standart bir uygulama için sabit bir uygulama kimliği kullanıyoruz.
const appId = firebaseConfig.projectId || 'default-app-id';

// Firebase Uygulamasını Başlatma (Sadece bir kez)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let currentUserId = null;

// --- 1. AUTHENTICATION MANTIĞI ---

// Auth durumu değiştiğinde çağrılır
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        // console.log("Kullanıcı Oturum Açtı:", currentUserId);
    } else {
        currentUserId = null;
        // console.log("Kullanıcı Oturum Kapattı.");
    }
});

/**
 * Oturum Açma: Normal bir web uygulamasında anonim giriş kullanılır.
 * Admin sayfasındaysa anonim girişi atlar (giriş formu çalışır).
 */
async function initializeAuth() {
    try {
        // Admin sayfasında değilsek, anonim olarak giriş yap
        if (!window.location.href.includes('admin.html')) {
            await signInAnonymously(auth);
            console.log("Anonim olarak oturum açıldı.");
        }
        // Admin sayfasında ise, giriş formunun çalışması beklenir.
    } catch (error) {
        console.error("Kimlik doğrulama başlatılırken hata oluştu:", error);
    }
}

// Hemen Auth işlemini başlat
initializeAuth();

// --- 2. FIRESTORE GENEL FONKSİYONLARI ---

/**
 * Ziyaretçi sayısını artırır.
 */
async function updateVisitorCount() {
    // Veri yolu: /artifacts/{appId}/public/data/visitorCount
    // Normal uygulamada, appId'yi projenin ID'si olarak kullanıyoruz.
    const docRef = doc(db, 'artifacts', appId, 'public/data', 'visitorCount');
    try {
        await updateDoc(docRef, { count: increment(1) });
    } catch (e) {
        if (e.code === 'not-found') {
            await setDoc(docRef, { count: 1 });
        } else {
            console.error("Ziyaretçi sayacı güncellenirken hata oluştu:", e);
        }
    }
}


/**
 * Kullanıcı kimlik doğrulama durumunu dinler
 * @param {function} callback - (user) => {} şeklinde bir geri çağırma fonksiyonu
 */
function listenToAuthChanges(callback) {
    return onAuthStateChanged(auth, callback);
}


// --- 3. DIŞA AKTARIMLAR ---

export { 
    db, 
    auth, 
    updateVisitorCount,
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
