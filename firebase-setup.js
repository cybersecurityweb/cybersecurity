// firebase-setup.js

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

// Gerekli Firebase Modüllerini Yükleme
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

// Firebase'i Başlatma
const app = initializeApp(firebaseConfig);

// Veritabanı ve Yetkilendirme (Auth) Referansları
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
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