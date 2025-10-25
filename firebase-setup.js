// firebase-setup.js - BİRLEŞTİRİLMİŞ VE TEMİZLENMİŞ KOD

// Firebase Konfigürasyonu (Sizin bilgilerinizle)
const firebaseConfig = {
    apiKey: "AIzaSyDdkl1ZV3f2opyXwcNFbEZHRvWcSTgLLJ4",
    authDomain: "cybersecurity-test-analytics.firebaseapp.com",
    projectId: "cybersecurity-test-analytics",
    storageBucket: "cybersecurity-test-analytics.firebasestorage.app",
    messagingSenderId: "1070203500987",
    appId: "1:1070203500987:web:0a3b257a0fabcb3ff02c9e",
    measurementId: "G-HBSRZWSKJ2"
};

// Gerekli Firebase Modüllerini Yükleme (Tüm Modüller Tek Bir Yerde Toplandı)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';

// firebase-setup.js içindeki import satırı (eski)
// import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, runTransaction } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// firebase-setup.js içindeki import satırı (YENİ VE EKSİKLERİ TAMAMLAYAN)
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, runTransaction, updateDoc, query, where, getDocs, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';


// Firebase'i Başlatma
const app = initializeApp(firebaseConfig);

// Veritabanı ve Yetkilendirme (Auth) Referansları
export const db = getFirestore(app);
export const auth = getAuth(app);


/**a
 * Test sonuçlarını Firestore veritabanına kaydeder.
 * @param {string} testType - 'pre' (ön test) veya 'post' (son test)
 * @param {object} answers - Kullanıcının tüm cevapları
 * @param {number} score - Toplam puan
 */
export async function saveTestResult(testType, answers, score) {
    try {
        await addDoc(collection(db, "test_results"), {
            testType: testType,
            answers: answers,
            totalScore: score,
            timestamp: serverTimestamp() // Kayıt zamanını Firestore'dan otomatik al
        });
        console.log("Sonuç Firebase'e başarıyla kaydedildi.");
        return true;
    } catch (e) {
        console.error("Sonuç kaydetme hatası:", e);
        return false;
    }
}


/**
 * Sayacı koşullu olarak bir artırır ve güncel değeri döndürür.
 * @param {boolean} shouldIncrement - True ise artır, False ise sadece mevcut değeri oku.
 */
export async function updateVisitorCount(shouldIncrement) {
    const counterRef = doc(db, "meta", "visitor_count");

    if (shouldIncrement) {
        // Artırma modu: Transaction kullanarak atomik artırma yap
        try {
            const newCount = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
                const updatedCount = currentCount + 1;
                
                transaction.set(counterRef, { count: updatedCount });
                return updatedCount;
            });
            return newCount;
        } catch (e) {
            console.error("Sayaç güncelleme hatası:", e);
            return "Hata";
        }
    } 
    else {
        // Sadece okuma modu
        try {
            const docSnap = await getDoc(counterRef);
            
            // *** YENİ: Hata Ayıklama Ekleme ***
            if (!docSnap.exists()) {
                console.warn("UYARI: Sayaç belgesi (meta/visitor_count) henüz mevcut değil. Sıfır döndürülüyor.");
            } else if (typeof docSnap.data().count !== 'number') {
                 console.error("HATA: Sayaç değeri ('count') Firestore'da sayı (number) tipinde değil. Tip kontrolü yapın!");
            }
            // *** SON ***

            return docSnap.exists() ? docSnap.data().count : 0;
        } catch (e) {
            // Hata durumunda bile 0 göster
            console.error("Sayaç okuma hatası:", e);
            return 0;
        }
    }
}

/**
 * Ziyaretçi sayacını manuel olarak belirli bir değere ayarlar.
 * @param {number} newCount - Sayaç için ayarlanacak yeni değer.
 */
export async function setVisitorCountManually(newCount) {
    if (typeof newCount !== 'number' || newCount < 0) {
        console.error("Hata: Sayaç değeri geçerli bir pozitif sayı olmalıdır.");
        return false;
    }
    const counterRef = doc(db, "meta", "visitor_count");
    try {
        await setDoc(counterRef, { count: newCount });
        console.log(`Sayaç değeri başarıyla ${newCount} olarak ayarlandı.`);
        return true;
    } catch (e) {
        console.error("Sayaç manuel ayarlama hatası:", e);
        return false;
    }
}


// *** Sadece Admin Paneli için EKLENEN GEREKLİ DIŞA AKTARMALAR ***
// Bu, auth ve veritabanı işlemlerinin admin-script.js'te kullanılmasını sağlar.

export {
    // Admin girişi için zorunlu olan fonksiyon
    signInWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

export {
    collection, 
    query, 
    getDocs, 
    where, 
    doc,
    deleteDoc // Bu satır daha önce altta bir kez daha tekrar ediyordu, şimdi yalnızca burada (Firestore import'u içinde) tutuluyor.
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// Eğer Admin panelinde appId kullanılıyorsa, onu da dışa aktaralım
// const appId değişkeni tanımlı olmadığı için (sadece bu ortamda tanımlı), admin panelinde path oluşturmak için 
// bu ortam değişkenini simüle edelim veya elle bir ID kullanalım. 
export const appId = "default-app-id";
