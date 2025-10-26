// --- ADMIN PANELİ GİRİŞ ve VERİ İŞLEME MANTIĞI ---
// Bu script, Firebase bağlantısını, kimlik doğrulamayı, veri çekmeyi ve dashboard'u güncellemeyi yönetir.

import { 
    db, 
    auth, 
    listenToAuthChanges, // Oturum dinleyicisinin sarıcısı
    signInWithEmailAndPassword, // Admin girişi için
    signOut, // Çıkış için
    collection,
    query, // query'yi ekledik
    getDocs
} from './firebase-setup.js'; 

// --- Global Değişkenler ---
let userIsAdmin = false; // Kullanıcının başarılı bir admin girişi yaptığını gösteren bayrak
let participantsData = [];
// 🔥 UYGULAMANIZDAKİ ASIL KOLEKSİYON ADINI BURAYA GİRİN
const COLLECTION_NAME = "veliler"; 

// Firestore'da veri yolu global olarak tanımlanmıştır: 
// /artifacts/{__app_id}/users/{userId}/veliler
// Admin, kendi verisine bakıyorsa, userId = adminUid olmalıdır.
// Eğer tüm kullanıcıların verisine (public) bakıyorsanız, bu yolu değiştirmeniz gerekir.

// --- DOM Elementleri ---
let loginForm, logoutButton, errorMessage, dashboardContainer, loginContainer;
let totalParticipantsElement, preTestAvgElement, postTestAvgElement, percentIncreaseElement;
let filterButton, resetButton, tableBody, csvExportButton;

/**
 * HTML'deki kritik DOM elemanlarını bulur ve atar.
 */
function initializeDOMElements() {
    loginForm = document.getElementById('loginForm');
    logoutButton = document.getElementById('logoutButton');
    errorMessage = document.getElementById('errorMessage');
    dashboardContainer = document.getElementById('dashboardContainer');
    loginContainer = document.getElementById('loginContainer');
    
    // Admin Dashboard Elementleri
    totalParticipantsElement = document.getElementById('totalParticipants');
    preTestAvgElement = document.getElementById('preTestAvg');
    postTestAvgElement = document.getElementById('postTestAvg');
    percentIncreaseElement = document.getElementById('percentIncrease');
    filterButton = document.getElementById('applyFiltersButton');
    resetButton = document.getElementById('resetFiltersButton');
    tableBody = document.getElementById('participantsTableBody');
    csvExportButton = document.getElementById('csvExportButton');

    // Temel konteyner kontrolü
    if (!loginForm || !errorMessage || !loginContainer || !dashboardContainer) {
        // Bu, HTML'deki ID'lerin bulunamadığı anlamına gelir.
        console.error("KRİTİK HATA: Admin panelinin HTML yapısı eksik (ID'ler bulunamadı).");
        return false;
    }
    return true;
}


// --- 2. AUTHENTICATION (Kimlik Doğrulama) ve Olay Dinleyicileri ---

function setupEventListeners() {
    if (!initializeDOMElements()) return;

    // Admin Girişi Formu Dinleyicisi
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Hata mesajını temizle
        errorMessage.innerHTML = ''; 

        const email = loginForm.email.value;
        const password = loginForm.password.value;
        
        try {
            // Gerçek Firebase Auth ile e-posta/şifre girişi denemesi
            await signInWithEmailAndPassword(auth, email, password);
            
            userIsAdmin = true; 
            
            // Başarılı girişten sonra yükleme ve paneli gösterme
            showAdminPanel(); 
            // Veriyi yüklerken hata oluşsa bile panel görünür, yükleme mesajı kalır.
            await loadData();
            
        } catch (error) {
            console.error("Giriş hatası:", error);
            // Firebase hata kodlarına göre kullanıcı dostu mesaj
            let displayMessage = "Giriş Başarısız: E-posta veya şifre yanlış.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                displayMessage = "E-posta veya şifre yanlış. Lütfen tekrar deneyin.";
            } else if (error.code === 'auth/invalid-api-key') { 
                displayMessage = "KRİTİK HATA: Firebase API Anahtarı (API Key) geçersiz. Lütfen 'firebase-setup.js' dosyasını kontrol edin.";
            } else if (error.code === 'auth/too-many-requests') {
                 displayMessage = "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.";
            }
            displayError(displayMessage);
        }
    });

    // Çıkış Butonu Dinleyicisi
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Çıkış yapıldığında durumu sıfırla
            userIsAdmin = false;
            participantsData = [];
            showLoginContainer();
            tableBody.innerHTML = '';
            clearKPIs();
        } catch (error) {
            console.error("Çıkış hatası:", error);
        }
    });

    // Filtreleme Butonu Dinleyicisi
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            updateDashboard(participantsData);
        });
    }

    // Filtre Sıfırlama Butonu Dinleyicisi
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Tüm filtreleri 'Tümü' yap
            document.getElementById('cinsiyetFilter').value = 'Tümü';
            document.getElementById('egitimFilter').value = 'Tümü';
            document.getElementById('internetFilter').value = 'Tümü';
            updateDashboard(participantsData);
        });
    }

    // CSV Dışa Aktar Butonu Dinleyicisi
    if (csvExportButton) {
        csvExportButton.addEventListener('click', () => {
            exportCSV(participantsData);
        });
    }
}


// --- 3. UI GÖRÜNÜM MANTIĞI ---

function showAdminPanel() {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
}

function showLoginContainer() {
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
}

function displayError(message) {
    if (errorMessage) {
        // Hata mesajını kart formatında göster
        errorMessage.innerHTML = `<div class="p-4 bg-red-800 text-white rounded-xl font-medium">${message}</div>`;
    }
}

function clearKPIs() {
    if (totalParticipantsElement) totalParticipantsElement.textContent = '—';
    if (preTestAvgElement) preTestAvgElement.textContent = '—';
    if (postTestAvgElement) postTestAvgElement.textContent = '—';
    if (percentIncreaseElement) {
        percentIncreaseElement.textContent = '—';
        percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
    }
}

// --- 4. VERİ YÜKLEME ve İŞLEME ---

/**
 * Firebase'den tüm katılımcı verilerini yükler.
 */
async function loadData() {
    if (!auth.currentUser || !userIsAdmin) {
        // Bu durum, listenToAuthChanges tarafından ele alınır, ancak ek bir kontrol
        return;
    }
    
    // Veri yüklenene kadar KPI'ları "Yükleniyor..." olarak bırakır (HTML'deki başlangıç değeridir)
    // Eğer yükleme mesajı hala varsa, muhtemelen burada takılmıştır.
    
    try {
        // Varsayım: Veri Yolu -> /artifacts/{appId}/users/{adminUid}/veliler
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Canvas'tan gelen global değişken
        const adminUid = auth.currentUser.uid; 
        
        // Bu, mevcut Canvas güvenlik kurallarına uygun olarak kullanıcının (adminin) özel verisine erişim yoludur.
        const collectionPath = `artifacts/${appId}/users/${adminUid}/${COLLECTION_NAME}`;

        console.log("Firestore'dan çekilen veri yolu: ", collectionPath); // Konsola yazdırarak doğru yolu kontrol edebilirsiniz.
        
        const collectionRef = collection(db, collectionPath); 
        const q = query(collectionRef); // Şu an filtre yok, tüm veriyi çek
        
        const snapshot = await getDocs(q);
        
        participantsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userID: data.userID || doc.id,
                // Demografik veriler
                cinsiyet: data.cinsiyet || 'Belirtilmemiş',
                yas: data.yas || 'Belirtilmemiş',
                egitim: data.egitim || 'Belirtilmemiş',
                internetSuresi: data.internetSuresi || 'Belirtilmemiş',
                // Puanları null kontrolü ile çek (Eksik testler için 'null' kullanılır)
                preScore: data.pretest?.score !== undefined ? data.pretest.score : null,
                postScore: data.posttest?.score !== undefined ? data.posttest.score : null,
            };
        });

        if (participantsData.length === 0) {
            // Hata değil, sadece veri yok.
            displayError("Veri tabanında kayıtlı katılımcı verisi bulunamadı. Kontrol Edilen Koleksiyon Yolu: " + collectionPath);
        } else {
             errorMessage.innerHTML = ''; // Başarılıysa hatayı temizle
        }

        updateDashboard(participantsData);

    } catch (error) {
        console.error("Veri yüklenirken kritik hata oluştu: ", error);
        // Hata durumunda KPI'ları temizle ve hata mesajını göster
        clearKPIs(); 
        displayError(`Veri yüklenirken bir hata oluştu: ${error.message}. Firestore koleksiyon yolu ve kurallarını kontrol edin.`);
    }
}

// --- 5. DASHBOARD GÜNCELLEME, FİLTRELEME ve CSV İŞLEMLERİ ---

function updateDashboard(data) {
    const filteredData = filterData(data);
    calculateKPIs(filteredData);
    renderTable(filteredData);
    renderChart(filteredData);
}

function filterData(data) {
    // Filtreleme butonlarının varlığını kontrol et
    const cinsiyetFilterEl = document.getElementById('cinsiyetFilter');
    const egitimFilterEl = document.getElementById('egitimFilter');
    const internetFilterEl = document.getElementById('internetFilter');

    if (!cinsiyetFilterEl || !egitimFilterEl || !internetFilterEl) return data; 
    
    const cinsiyetFilter = cinsiyetFilterEl.value || 'Tümü';
    const egitimFilter = egitimFilterEl.value || 'Tümü';
    const internetFilter = internetFilterEl.value || 'Tümü';
    
    return data.filter(p => {
        // Cinsiyet filtresi
        const cinsiyetMatch = cinsiyetFilter === 'Tümü' || p.cinsiyet === cinsiyetFilter;
        // Eğitim filtresi
        const egitimMatch = egitimFilter === 'Tümü' || p.egitim === egitimFilter;
        // İnternet süresi filtresi
        const internetMatch = internetFilter === 'Tümü' || p.internetSuresi === internetFilter;
        
        return cinsiyetMatch && internetMatch && egitimMatch;
    });
}

function calculateKPIs(data) {
    // Sadece hem ön hem de son testi tamamlanmış katılımcıları al
    const completedTests = data.filter(p => p.preScore !== null && p.postScore !== null);
    
    if (!totalParticipantsElement) return;

    totalParticipantsElement.textContent = data.length; // Toplam filtrelenmiş katılımcı sayısı

    if (completedTests.length === 0) {
        // Veri yoksa veya filtreden sonra kimse kalmadıysa KPI'ları sıfırla
        preTestAvgElement.textContent = '—';
        postTestAvgElement.textContent = '—';
        percentIncreaseElement.textContent = '—';
        percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
        return;
    }
    
    const totalPreScore = completedTests.reduce((sum, p) => sum + p.preScore, 0);
    const totalPostScore = completedTests.reduce((sum, p) => sum + p.postScore, 0);

    // Ortalamaları tek ondalık basamağa yuvarla
    const preAvg = Math.round((totalPreScore / completedTests.length) * 10) / 10;
    const postAvg = Math.round((totalPostScore / completedTests.length) * 10) / 10;
    
    preTestAvgElement.textContent = `${preAvg}`;
    postTestAvgElement.textContent = `${postAvg}`;

    if (preAvg > 0) {
        const increase = ((postAvg - preAvg) / preAvg) * 100;
        percentIncreaseElement.textContent = `${increase >= 0 ? '+' : ''}${Math.round(increase)}%`;
        // Artışa göre renk sınıfını ayarla
        percentIncreaseElement.className = `text-3xl font-bold mt-1 ${increase >= 0 ? 'text-green-400' : 'text-red-400'}`;
    } else {
         percentIncreaseElement.textContent = `—`;
         percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
    }
}

function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Tabloyu temizle
    
    data.forEach(p => {
        const row = tableBody.insertRow();
        row.className = 'hover:bg-gray-800 transition-colors border-b border-gray-700';
        
        // Kullanıcı ID'sinin ilk 8 karakterini göster
        const displayUserId = p.userID ? String(p.userID).substring(0, 8) + '...' : 'N/A';
        
        row.insertCell().textContent = displayUserId;
        row.insertCell().textContent = p.yas || '—';
        row.insertCell().textContent = p.cinsiyet || '—';
        row.insertCell().textContent = p.egitim || '—';
        row.insertCell().textContent = p.internetSuresi || '—';
        
        // Ön Test Puanı
        const preCell = row.insertCell();
        preCell.textContent = p.preScore !== null ? p.preScore : '—';
        preCell.className = p.preScore !== null ? 'text-blue-400 font-semibold' : 'text-gray-400';

        // Son Test Puanı
        const postCell = row.insertCell();
        postCell.textContent = p.postScore !== null ? p.postScore : '—';
        postCell.className = p.postScore !== null ? 'text-yellow-400 font-semibold' : 'text-gray-400';

        // Fark
        const diffCell = row.insertCell();
        if (p.preScore !== null && p.postScore !== null) {
            const diff = p.postScore - p.preScore;
            diffCell.textContent = `${diff > 0 ? '+' : ''}${diff}`;
            diffCell.className = `font-bold ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`;
        } else {
            diffCell.textContent = '—';
        }
    });
}

function renderChart(data) {
    const completedTests = data.filter(p => p.preScore !== null && p.postScore !== null);
    
    const preAvg = completedTests.length > 0 
        ? completedTests.reduce((sum, p) => sum + p.preScore, 0) / completedTests.length 
        : 0;
    const postAvg = completedTests.length > 0 
        ? completedTests.reduce((sum, p) => sum + p.postScore, 0) / completedTests.length 
        : 0;
    
    const chartData = [
        { label: 'Ön Test', value: preAvg, color: '#3b82f6' }, // Blue-500
        { label: 'Son Test', value: postAvg, color: '#f59e0b' } // Yellow-500
    ];

    const chartContainer = document.getElementById('testComparisonChart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = ''; // Grafiği temizle
    
    const maxValue = 10; // Puan maksimum 10 olduğu varsayılıyor
    
    // Konteyner stilini ayarla
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'flex-end';
    chartContainer.style.height = '200px';
    chartContainer.style.padding = '20px';
    chartContainer.style.gap = '40px';
    chartContainer.style.justifyContent = 'center';

    chartData.forEach(item => {
        // Çubuğun yüksekliği (maksimum 160px olacak şekilde)
        const height = (item.value / maxValue) * 160; 
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'flex flex-col items-center';
        
        // Değerin gösterimi
        const valueDisplay = document.createElement('div');
        valueDisplay.textContent = Math.round(item.value * 10) / 10; 
        valueDisplay.className = 'text-sm font-semibold mb-1 ' + (item.value > 0 ? 'text-white' : 'text-gray-500');

        // Çubuk
        const bar = document.createElement('div');
        bar.style.height = `${Math.max(5, height)}px`; // Minimum yükseklik 5px
        bar.style.width = '40px';
        bar.style.backgroundColor = item.color;
        bar.style.borderRadius = '4px 4px 0 0';
        bar.style.transition = 'height 0.5s ease-out';
        bar.title = `${item.label}: ${Math.round(item.value * 10) / 10}`;

        // Etiket
        const label = document.createElement('div');
        label.textContent = item.label;
        label.className = 'text-xs mt-2 text-gray-400';

        barWrapper.appendChild(valueDisplay);
        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        chartContainer.appendChild(barWrapper);
    });
}

function exportCSV(data) {
    if (data.length === 0) {
        displayError("Dışa aktarılacak veri bulunamadı."); 
        return;
    }

    const headers = [
        'Kullanici ID', 'Cinsiyet', 'Yas', 'Egitim', 
        'Internet Suresi', 'On Test Puan', 'Son Test Puan', 'Puan Farki'
    ];

    const csvRows = data.map(p => {
        const diff = (p.postScore !== null && p.preScore !== null) ? (p.postScore - p.preScore) : '';
        return [
            // Metin alanları tırnak içine alınır ve tüm alanlar noktalı virgülle ayrılır
            `"${p.userID}"`, 
            `"${p.cinsiyet}"`,
            `"${p.yas}"`,
            `"${p.egitim}"`,
            `"${p.internetSuresi}"`,
            p.preScore !== null ? p.preScore : '',
            p.postScore !== null ? p.postScore : '',
            diff
        ].join(';'); 
    });

    const csvContent = [
        headers.join(';'),
        ...csvRows
    ].join('\n');

    // UTF-8 BOM ekleniyor (Türkçe karakterler ve Excel uyumluluğu için)
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Dosyayı indirmek için gizli bir 'a' etiketi kullan
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'siber_farkindalik_verileri.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- 6. İLK BAŞLATMA ---

window.onload = () => {
    // 1. DOM elemanlarını başlat
    if (!initializeDOMElements()) return;
    
    // 2. Olay dinleyicilerini kur
    setupEventListeners();
    
    // 3. Auth durumunu dinle
    listenToAuthChanges((user) => { 
        // Kullanıcı oturum açtıysa, admin bayrağını true kabul edip verileri yüklemeye başla
        if (user && userIsAdmin) { 
            showAdminPanel();
            // Veri zaten yüklendiyse (yani sayfa yenilenmediyse) tekrar yükleme.
            if (participantsData.length === 0) {
                 loadData();
            }
        } else {
            // Oturum kapalıysa veya admin girişi yapılmadıysa login'i göster
            userIsAdmin = false;
            showLoginContainer();
        }
    });
};
