// Firebase SDK'sinden gerekli modüllerin en güncel versiyonu import ediliyor.
// Canvas ortamında URL üzerinden import edilmesi zorunludur.
import { initializeApp, setLogLevel } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, runTransaction, updateDoc, query, where, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';


// --- ZORUNLU CANVAS ORTAM AYARLARI ---
// Bu ortamda, config bilgileri global değişkenler üzerinden sağlanır.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
// Uygulama ID'si, koleksiyon yollarını doğru oluşturmak için gereklidir.
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Hata ayıklama (debug) loglarını aç
setLogLevel('debug');


// Firebase'i Başlatma
export const app = initializeApp(firebaseConfig);

// Veritabanı ve Yetkilendirme (Auth) Referansları
export const db = getFirestore(app);
export const auth = getAuth(app);


/**
 * Test sonuçlarını Firestore veritabanına kaydeder.
 * Admin paneli için bu fonksiyon gerekli olmayabilir, ancak uyumluluk için tutuluyor.
 * @param {string} testType - 'pre' (ön test) veya 'post' (son test)
 * @param {object} answers - Kullanıcının tüm cevapları
 * @param {number} score - Toplam puan
 * @param {object} userData - Kullanıcı demografik verileri (Cinsiyet, Yaş vb.)
 */
export async function saveTestResult(testType, answers, score, userData) {
    try {
        // Verilerinizi 'test_results' koleksiyonuna kaydediyoruz.
        // Güvenlik kurallarınıza göre bu yol değişebilir (örnek: public/data/test_results)
        await addDoc(collection(db, "test_results"), {
            testType: testType,
            answers: answers,
            totalScore: score,
            userData: userData, // Yeni demografik veriler
            timestamp: serverTimestamp() 
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
            return docSnap.exists() ? docSnap.data().count : 0;
        } catch (e) {
            console.error("Sayaç okuma hatası:", e);
            return 0;
        }
    }
}

// Admin panelinde kullanılacak gerekli fonksiyonlar toplu olarak dışa aktarılıyor.
export {
    collection, 
    addDoc, 
    serverTimestamp, 
    doc, 
    getDoc, 
    runTransaction, 
    updateDoc, 
    query, 
    where, 
    getDocs,
    deleteDoc,
    // Admin girişi için bu zorunludur.
    signInWithEmailAndPassword 
};
