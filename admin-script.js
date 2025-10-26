// --- ADMIN PANELİ GİRİŞ ve VERİ İŞLEME MANTIĞI ---
// Bu script, Firebase bağlantısını, kimlik doğrulamayı, veri çekmeyi ve dashboard'u güncellemeyi yönetir.

import { 
    db, 
    auth, 
    listenToAuthChanges, // Oturum dinleyicisinin sarıcısı
    signInWithEmailAndPassword, // Admin girişi için
    signOut, // Çıkış için
    collection,
    query, 
    getDocs
} from './firebase-setup.js'; 

// --- Global Değişkenler ---
let userIsAdmin = false; 
let participantsData = [];
// 🔥 UYGULAMANIZDAKİ ASIL KOLEKSİYON ADINI BURAYA GİRİN
const test_results = "veliler"; 

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
            await signInWithEmailAndPassword(auth, email, password);
            
            userIsAdmin = true; 
            
            showAdminPanel(); 
            // Giriş başarılı olduktan sonra veriyi yüklemeye çalış
            await loadData();
            
        } catch (error) {
            console.error("Giriş hatası:", error);
            let displayMessage = "Giriş Başarısız: E-posta veya şifre yanlış.";
            if (error.code === 'auth/invalid-api-key') { 
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
            userIsAdmin = false;
            participantsData = [];
            showLoginContainer();
            tableBody.innerHTML = '';
            clearKPIs();
        } catch (error) {
            console.error("Çıkış hatası:", error);
        }
    });

    // Filtreleme Butonu Dinleyicileri (Diğer fonksiyonlar aynı kaldı)
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            updateDashboard(participantsData);
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            document.getElementById('cinsiyetFilter').value = 'Tümü';
            document.getElementById('egitimFilter').value = 'Tümü';
            document.getElementById('internetFilter').value = 'Tümü';
            updateDashboard(participantsData);
        });
    }

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
        errorMessage.innerHTML = `<div class="p-4 bg-red-800 text-white rounded-xl font-medium">${message}</div>`;
    }
}

function clearKPIs() {
    // Yükleniyor durumunu simüle etmek için HTML'e geri döndürülür
    const loadingText = "Yükleniyor..."; 
    if (totalParticipantsElement) totalParticipantsElement.textContent = loadingText;
    if (preTestAvgElement) preTestAvgElement.textContent = loadingText;
    if (postTestAvgElement) postTestAvgElement.textContent = loadingText;
    if (percentIncreaseElement) {
        percentIncreaseElement.textContent = loadingText;
        percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
    }
}


// --- 4. VERİ YÜKLEME ve İŞLEME ---

/**
 * Firebase'den tüm katılımcı verilerini yükler.
 */
async function loadData() {
    if (!auth.currentUser || !userIsAdmin) {
        return;
    }
    
    // Yükleniyor durumunu ayarla
    clearKPIs(); 
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-400">Veriler Yükleniyor...</td></tr>';

    
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const adminUid = auth.currentUser.uid; 
        
        // Veri Yolu: /artifacts/{appId}/users/{adminUid}/veliler
       // admin-script.js içinde:
       const collectionPath = `artifacts/${appId}/public/data/${test_results}`;

        // 🔥🔥🔥 HATA AYIKLAMA (DEBUG) KONTROLLERİ 🔥🔥🔥
        console.log("--- FIREBASE VERİ YÜKLEME BAŞLADI ---");
        console.log("Canvas APP ID: ", appId);
        console.log("Admin UID: ", adminUid);
        console.log("Hedef Koleksiyon Yolu: ", collectionPath);
        console.log("--- Kontrol Ediniz: Bu yol Firebase Konsolundaki veri yolu ile tam olarak eşleşiyor mu? ---");
        
        const collectionRef = collection(db, collectionPath); 
        const q = query(collectionRef); 
        
        const snapshot = await getDocs(q); // Burası takılıyor olabilir!
        
        // 🔥🔥🔥 BAŞARILI ÇEKİM KONTROLÜ 🔥🔥🔥
        console.log(`Veri Çekme Başarılı. Toplam belge sayısı: ${snapshot.docs.length}`);

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
                // Puanları null kontrolü ile çek
                preScore: data.pretest?.score !== undefined ? data.pretest.score : null,
                postScore: data.posttest?.score !== undefined ? data.posttest.score : null,
            };
        });

        if (participantsData.length === 0) {
            displayError("Veri tabanında kayıtlı katılımcı verisi bulunamadı veya güvenlik kuralları erişimi engelledi.");
        } else {
             errorMessage.innerHTML = ''; // Başarılıysa hatayı temizle
        }

        updateDashboard(participantsData);

    } catch (error) {
        // Ağ (Network) veya başka bir kritik hata yakalandı
        console.error("Veri yüklenirken kritik HATA oluştu:", error);
        clearKPIs(); 
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-red-400">Veri yüklenemedi. Konsolu kontrol edin.</td></tr>';
        displayError(`Veri yüklenirken bir hata oluştu: ${error.message}. (Genellikle ağ veya kural hatası).`);
    }
}

// --- 5. DASHBOARD GÜNCELLEME, FİLTRELEME ve CSV İŞLEMLERİ (Aynı kaldı) ---

function filterData(data) {
    // Filtreleme kodları aynı kaldı
    const cinsiyetFilterEl = document.getElementById('cinsiyetFilter');
    const egitimFilterEl = document.getElementById('egitimFilter');
    const internetFilterEl = document.getElementById('internetFilter');

    if (!cinsiyetFilterEl || !egitimFilterEl || !internetFilterEl) return data; 
    
    const cinsiyetFilter = cinsiyetFilterEl.value || 'Tümü';
    const egitimFilter = egitimFilterEl.value || 'Tümü';
    const internetFilter = internetFilterEl.value || 'Tümü';
    
    return data.filter(p => {
        const cinsiyetMatch = cinsiyetFilter === 'Tümü' || p.cinsiyet === cinsiyetFilter;
        const egitimMatch = egitimFilter === 'Tümü' || p.egitim === egitimFilter;
        const internetMatch = internetFilter === 'Tümü' || p.internetSuresi === internetFilter;
        
        return cinsiyetMatch && internetMatch && egitimMatch;
    });
}

function calculateKPIs(data) {
    const completedTests = data.filter(p => p.preScore !== null && p.postScore !== null);
    
    if (!totalParticipantsElement) return;

    totalParticipantsElement.textContent = data.length; 

    if (completedTests.length === 0) {
        preTestAvgElement.textContent = '—';
        postTestAvgElement.textContent = '—';
        percentIncreaseElement.textContent = '—';
        percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
        return;
    }
    
    const totalPreScore = completedTests.reduce((sum, p) => sum + p.preScore, 0);
    const totalPostScore = completedTests.reduce((sum, p) => sum + p.postScore, 0);

    const preAvg = Math.round((totalPreScore / completedTests.length) * 10) / 10;
    const postAvg = Math.round((totalPostScore / completedTests.length) * 10) / 10;
    
    preTestAvgElement.textContent = `${preAvg}`;
    postTestAvgElement.textContent = `${postAvg}`;

    if (preAvg > 0) {
        const increase = ((postAvg - preAvg) / preAvg) * 100;
        percentIncreaseElement.textContent = `${increase >= 0 ? '+' : ''}${Math.round(increase)}%`;
        percentIncreaseElement.className = `text-3xl font-bold mt-1 ${increase >= 0 ? 'text-green-400' : 'text-red-400'}`;
    } else {
         percentIncreaseElement.textContent = `—`;
         percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
    }
}

function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = ''; 
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-400">Filtreye uyan katılımcı bulunamadı.</td></tr>';
        return;
    }

    data.forEach(p => {
        const row = tableBody.insertRow();
        row.className = 'hover:bg-gray-800 transition-colors border-b border-gray-700';
        
        const displayUserId = p.userID ? String(p.userID).substring(0, 8) + '...' : 'N/A';
        
        row.insertCell().textContent = displayUserId;
        row.insertCell().textContent = p.yas || '—';
        row.insertCell().textContent = p.cinsiyet || '—';
        row.insertCell().textContent = p.egitim || '—';
        row.insertCell().textContent = p.internetSuresi || '—';
        
        const preCell = row.insertCell();
        preCell.textContent = p.preScore !== null ? p.preScore : '—';
        preCell.className = p.preScore !== null ? 'text-blue-400 font-semibold' : 'text-gray-400';

        const postCell = row.insertCell();
        postCell.textContent = p.postScore !== null ? p.postScore : '—';
        postCell.className = p.postScore !== null ? 'text-yellow-400 font-semibold' : 'text-gray-400';

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
        { label: 'Ön Test', value: preAvg, color: '#3b82f6' }, 
        { label: 'Son Test', value: postAvg, color: '#f59e0b' } 
    ];

    const chartContainer = document.getElementById('testComparisonChart');
    if (!chartContainer) return;
    
    chartContainer.innerHTML = ''; 
    
    const maxValue = 10; 
    
    // Konteyner stilini ayarla
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'flex-end';
    chartContainer.style.height = '200px';
    chartContainer.style.padding = '20px';
    chartContainer.style.gap = '40px';
    chartContainer.style.justifyContent = 'center';

    chartData.forEach(item => {
        const height = (item.value / maxValue) * 160; 
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'flex flex-col items-center';
        
        const valueDisplay = document.createElement('div');
        valueDisplay.textContent = Math.round(item.value * 10) / 10; 
        valueDisplay.className = 'text-sm font-semibold mb-1 ' + (item.value > 0 ? 'text-white' : 'text-gray-500');

        const bar = document.createElement('div');
        bar.style.height = `${Math.max(5, height)}px`; 
        bar.style.width = '40px';
        bar.style.backgroundColor = item.color;
        bar.style.borderRadius = '4px 4px 0 0';
        bar.style.transition = 'height 0.5s ease-out';
        bar.title = `${item.label}: ${Math.round(item.value * 10) / 10}`;

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
    // CSV dışa aktarma kodları aynı kaldı
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

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'siber_farkindalik_verileri.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- 6. İLK BAŞLATMA ---

window.onload = () => {
    if (!initializeDOMElements()) return;
    setupEventListeners();
    
    // Başlangıçta KPI'ları ve tabloyu yükleniyor olarak göster
    clearKPIs();
    if(tableBody) tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-gray-400">Giriş bekleniyor...</td></tr>';
    
    listenToAuthChanges((user) => { 
        if (user) { 
            // Kullanıcı oturum açtıysa, admin kabul et ve paneli göster
            userIsAdmin = true;
            showAdminPanel();
            if (participantsData.length === 0) {
                 loadData();
            }
        } else {
            // Oturum kapalıysa login'i göster
            userIsAdmin = false;
            showLoginContainer();
        }
    });
};
