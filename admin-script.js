<<<<<<< HEAD
// admin-script.js
// Bu dosya, admin girişi ve Firebase'den istatistik çekme işlemini yönetir.

import { auth, db } from './firebase-setup.js'; // Önemli: firebase-setup.js'den import ediyoruz
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// HTML Elementleri
const loginForm = document.getElementById('login-form');
const adminEmail = document.getElementById('admin-email');
const adminPassword = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const statsPanel = document.getElementById('stats-panel');
const statsContent = document.getElementById('stats-content');
const logoutBtn = document.getElementById('logout-btn');

// Admin Giriş İşlemi
loginBtn.addEventListener('click', async () => {
    const email = adminEmail.value;
    const password = adminPassword.value;
    
    loginError.style.display = 'none';
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Giriş hatası:", error);
        loginError.style.display = 'block';
    }
});

// Çıkış İşlemi
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});


// Kimlik Doğrulama Durumu Değiştiğinde
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı Giriş Yaptı (Admin)
        loginForm.style.display = 'none';
        statsPanel.style.display = 'block';
        fetchStats(); // İstatistikleri çekmeye başla
    } else {
        // Kullanıcı Çıkış Yaptı
        loginForm.style.display = 'block';
        statsPanel.style.display = 'none';
        statsContent.innerHTML = '<p>Lütfen giriş yapın.</p>';
    }
});

// Veritabanından İstatistikleri Çekme ve Hesaplama
async function fetchStats() {
    statsContent.innerHTML = 'İstatistikler yükleniyor...';
    try {
        const querySnapshot = await getDocs(collection(db, "test_results"));
        
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push(doc.data());
        });
        
        displayStats(results); 
        
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        statsContent.innerHTML = '<p style="color: red;">Veri çekilirken bir hata oluştu.</p>';
    }
}

// İstatistikleri Ekranda Gösterme
function displayStats(results) {
    if (results.length === 0) {
        statsContent.innerHTML = 'Henüz hiçbir test sonucu kaydedilmemiş.';
        return;
    }
    
    // Toplam test sayısını ve puanları hesapla
    const totalTests = results.length;
    let totalScoreSum = 0;

    results.forEach(result => {
        totalScoreSum += result.totalScore;
    });

    const averageScore = (totalScoreSum / totalTests).toFixed(2);
    
    // Testte 7 soru ve her sorunun max 7 puan (Kesinlikle Katılıyorum) olduğunu varsayarsak max puan 49'dur.
    const maxScore = 7 * 7; 
    
    statsContent.innerHTML = `
        <h3>Genel Bakış</h3>
        <p><strong>Toplam Yapılan Test Sayısı:</strong> ${totalTests}</p>
        <p><strong>Ortalama Puan:</strong> ${averageScore} / ${maxScore}</p>
        
        <h3 style="margin-top: 30px;">Tüm Kayıtlar</h3>
        <ul style="list-style-type: none; padding: 0;">
            ${results.map(r => `
                <li style="border-bottom: 1px solid #333; padding: 10px 0;">
                    <strong>Puan:</strong> ${r.totalScore} 
                    (Tarih: ${r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleString('tr-TR') : 'Yükleniyor'})
                </li>
            `).join('')}
        </ul>
    `;
=======
// admin-script.js
// Bu dosya, admin girişi ve Firebase'den istatistik çekme işlemini yönetir.

import { auth, db } from './firebase-setup.js'; // Önemli: firebase-setup.js'den import ediyoruz
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// HTML Elementleri
const loginForm = document.getElementById('login-form');
const adminEmail = document.getElementById('admin-email');
const adminPassword = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const statsPanel = document.getElementById('stats-panel');
const statsContent = document.getElementById('stats-content');
const logoutBtn = document.getElementById('logout-btn');

// Admin Giriş İşlemi
loginBtn.addEventListener('click', async () => {
    const email = adminEmail.value;
    const password = adminPassword.value;
    
    loginError.style.display = 'none';
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Giriş hatası:", error);
        loginError.style.display = 'block';
    }
});

// Çıkış İşlemi
logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
});


// Kimlik Doğrulama Durumu Değiştiğinde
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Kullanıcı Giriş Yaptı (Admin)
        loginForm.style.display = 'none';
        statsPanel.style.display = 'block';
        fetchStats(); // İstatistikleri çekmeye başla
    } else {
        // Kullanıcı Çıkış Yaptı
        loginForm.style.display = 'block';
        statsPanel.style.display = 'none';
        statsContent.innerHTML = '<p>Lütfen giriş yapın.</p>';
    }
});

// Veritabanından İstatistikleri Çekme ve Hesaplama
async function fetchStats() {
    statsContent.innerHTML = 'İstatistikler yükleniyor...';
    try {
        const querySnapshot = await getDocs(collection(db, "test_results"));
        
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push(doc.data());
        });
        
        displayStats(results); 
        
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        statsContent.innerHTML = '<p style="color: red;">Veri çekilirken bir hata oluştu.</p>';
    }
}

// İstatistikleri Ekranda Gösterme
function displayStats(results) {
    if (results.length === 0) {
        statsContent.innerHTML = 'Henüz hiçbir test sonucu kaydedilmemiş.';
        return;
    }
    
    // Toplam test sayısını ve puanları hesapla
    const totalTests = results.length;
    let totalScoreSum = 0;

    results.forEach(result => {
        totalScoreSum += result.totalScore;
    });

    const averageScore = (totalScoreSum / totalTests).toFixed(2);
    
    // Testte 7 soru ve her sorunun max 7 puan (Kesinlikle Katılıyorum) olduğunu varsayarsak max puan 49'dur.
    const maxScore = 7 * 7; 
    
    statsContent.innerHTML = `
        <h3>Genel Bakış</h3>
        <p><strong>Toplam Yapılan Test Sayısı:</strong> ${totalTests}</p>
        <p><strong>Ortalama Puan:</strong> ${averageScore} / ${maxScore}</p>
        
        <h3 style="margin-top: 30px;">Tüm Kayıtlar</h3>
        <ul style="list-style-type: none; padding: 0;">
            ${results.map(r => `
                <li style="border-bottom: 1px solid #333; padding: 10px 0;">
                    <strong>Puan:</strong> ${r.totalScore} 
                    (Tarih: ${r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleString('tr-TR') : 'Yükleniyor'})
                </li>
            `).join('')}
        </ul>
    `;
>>>>>>> 89b5b77 (Son sayaç ve quiz düzeltmeleri.)
}