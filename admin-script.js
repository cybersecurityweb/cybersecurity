// --- ADMIN PANELİ GİRİŞ ve VERİ İŞLEME MANTIĞI ---
// Bu versiyon, standart web ortamına uyarlanmıştır ve firebase-setup.js dosyasındaki 
// konfigürasyona bağımlıdır.

import { 
    db, 
    auth, 
    listenToAuthChanges, // Oturum durumunu dinlemek için 
    signInWithEmailAndPassword, // Admin girişi için
    signOut, // Çıkış için
    collection,
    query,
    where,
    getDocs,
    doc
} from './firebase-setup.js'; 

// --- Global Değişkenler ---
let userIsAdmin = false; 
let participantsData = [];
const COLLECTION_NAME = "veliler"; // Verilerin tutulduğu koleksiyon adı

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
        const htmlError = document.createElement('div');
        htmlError.className = "p-4 bg-red-800 text-white rounded-lg font-bold";
        htmlError.textContent = "KRİTİK HATA: Admin panelinin HTML yapısı eksik (ID'ler bulunamadı).";
        document.body.prepend(htmlError);
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
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        
        try {
            // Gerçek Firebase Auth ile e-posta/şifre girişi denemesi
            await signInWithEmailAndPassword(auth, email, password);
            
            userIsAdmin = true; 
            errorMessage.innerHTML = '';
            
            showAdminPanel(); 
            await loadData();
            
        } catch (error) {
            console.error("Giriş hatası:", error);
            // Firebase hata kodlarına göre kullanıcı dostu mesaj
            let displayMessage = "Giriş Başarısız: E-posta veya şifre yanlış.";
            if (error.code === 'auth/user-not-found') {
                displayMessage = "Bu e-posta adresine kayıtlı kullanıcı bulunamadı.";
            } else if (error.code === 'auth/wrong-password') {
                displayMessage = "Yanlış şifre. Lütfen tekrar deneyin.";
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

    // Filtreleme Butonu Dinleyicisi
    if (filterButton) {
        filterButton.addEventListener('click', () => {
            updateDashboard(participantsData);
        });
    }

    // Filtre Sıfırlama Butonu Dinleyicisi
    if (resetButton) {
        resetButton.addEventListener('click', () => {
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
        errorMessage.innerHTML = `<div class="p-4 bg-red-800 text-white rounded-lg">${message}</div>`;
    }
}

function clearKPIs() {
    if (totalParticipantsElement) totalParticipantsElement.textContent = '—';
    if (preTestAvgElement) preTestAvgElement.textContent = '—';
    if (postTestAvgElement) postTestAvgElement.textContent = '—';
    if (percentIncreaseElement) percentIncreaseElement.textContent = '—';
}

// --- 4. VERİ YÜKLEME ve İŞLEME ---

/**
 * Firebase'den tüm katılımcı verilerini yükler.
 */
async function loadData() {
    if (!auth.currentUser || !userIsAdmin) {
        displayError("Verileri yüklemek için admin olarak giriş yapmalısınız.");
        return;
    }
    
    try {
        // Normal web uygulamasında App ID, auth.currentUser.uid'den farklıdır. 
        // Ancak bu yapıda, veri yolunun /artifacts/{appId}/veliler şeklinde olduğunu varsayıyoruz.
        // Güvenilir olması açısından, giriş yapan kullanıcının UID'sini geçici appId olarak kullanalım.
        const appId = auth.currentUser.uid; 
        
        // Veri yolu: artifacts/{adminUID}/veliler (Bu, index.html'deki kaydetme yolunuza bağlıdır)
        const collectionRef = collection(db, 'artifacts', appId, COLLECTION_NAME); 

        const snapshot = await getDocs(collectionRef);
        
        participantsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userID: data.userID || doc.id,
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
            displayError("Veri tabanında kayıtlı katılımcı verisi bulunamadı. (Kontrol Edilen Koleksiyon Yolu: artifacts/"+appId+"/"+COLLECTION_NAME+")");
        }

        updateDashboard(participantsData);

    } catch (error) {
        console.error("Veri yüklenirken kritik hata oluştu: ", error);
        displayError(`Veri yüklenirken bir hata oluştu: ${error.message}. Firestore koleksiyon yolu izinlerini kontrol edin.`);
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
    if (!filterButton) return data; 
    
    return data.filter(p => {
        const cinsiyetFilter = document.getElementById('cinsiyetFilter')?.value || 'Tümü';
        const egitimFilter = document.getElementById('egitimFilter')?.value || 'Tümü';
        const internetFilter = document.getElementById('internetFilter')?.value || 'Tümü';
        
        const cinsiyetMatch = cinsiyetFilter === 'Tümü' || p.cinsiyet === cinsiyetFilter;
        const egitimMatch = egitimFilter === 'Tümü' || p.egitim === egitimFilter;
        const internetMatch = internetFilter === 'Tümü' || p.internetSuresi === internetFilter;
        
        return cinsiyetMatch && egitimMatch && internetMatch;
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
        percentIncreaseElement.textContent = `${increase > 0 ? '+' : ''}${Math.round(increase)}%`;
        percentIncreaseElement.className = `text-3xl font-bold mt-1 ${increase >= 0 ? 'text-green-400' : 'text-red-400'}`;
    } else {
         percentIncreaseElement.textContent = `—`;
         percentIncreaseElement.className = `text-3xl font-bold text-gray-400 mt-1`;
    }
}

function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    data.forEach(p => {
        const row = tableBody.insertRow();
        row.className = 'hover:bg-gray-800 transition-colors border-b border-gray-700';
        
        // Kullanıcı ID'sinin ilk 8 karakteri
        const displayUserId = p.userID ? String(p.userID).substring(0, 8) : 'N/A';
        
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

    // UTF-8 BOM ekleniyor (Türkçe karakterler için)
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
    // 1. DOM elemanlarını başlat
    if (!initializeDOMElements()) return;
    
    // 2. Olay dinleyicilerini kur
    setupEventListeners();
    
    // 3. Auth durumunu dinle
    listenToAuthChanges((user) => {
        // Kullanıcı oturum açtıysa ve 'userIsAdmin' bayrağı true ise
        if (user && userIsAdmin) { 
            showAdminPanel();
            // Veri zaten yüklendiyse tekrar yükleme (sayfa yenilenmesi dışında)
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
