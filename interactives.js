
document.addEventListener('DOMContentLoaded', () => {
    // Sadece Phishing simülatörü olan sayfada çalıştır
    const simulatorContainer = document.getElementById('phishing-simulator');
    if (!simulatorContainer) return; 

    const stageContainer = document.getElementById('phishing-stage-container');
    const resetButton = document.getElementById('reset-phishing');
    let currentStage = 0;

    const stages = [
        {
          type: 'email',
            // GÜNCELLENMİŞ HTML KODU BAŞLANGICI
            html: `
                <div class="email-mockup-modern">
                    <div class="email-header-modern">
                        Kime: <span class="sender-mail-modern">destek@banka-guvenlik.com</span> | Konu: Bankanızdan Önemli Uyarı!
                    </div>
                    <div class="email-body-modern">
                        <p>Değerli müşterimiz,</p>
                        <p>Hesabınızda şüpheli işlemler tespit edilmiştir. Hesabınızın güvenliğini sağlamak için lütfen aşağıdaki butona tıklayarak bilgilerinizi güncelleyin.</p>
                        <div class="email-action-area-modern">
                            <button class="phishing-action-button" data-action="next-step">Hesabınızı Kontrol Edin</button>
                        </div>
                        <p class="warning-tip">İpucu: Gönderici e-posta adresini kontrol edin.</p>
                    </div>
                </div>
            `,
            // GÜNCELLENMİŞ HTML KODU SONU
            tip: "E-postanın gönderen adresini ve aciliyet içeren dilini incelediniz mi?"
        },
    
        {
            type: 'form',
            // GÜNCELLENMİŞ HTML KODU: FORM
            html: `
                <div class="simulator-stage-box">
                    <div class="browser-address-bar-modern">
                        <span class="warning-icon-modern">⚠️</span> <span class="url-text-modern">http://banka-secure.kfklfdlk.com</span>
                    </div>
                    <div class="browser-content-modern">
                        <h2>Hesabınızda şüpheli hareket tespit edildi.</h2>
                        <input type="text" placeholder="TC Kimlik / Kart No" />
                        <input type="password" placeholder="Şifreniz" />
                        <button class="phishing-action-button" data-action="submit-data">Giriş Yap</button>
                    </div>
                    <p class="warning-tip-box">İpucu: URL'nin HTTPS ile başlamamasına ve alan adına dikkat edin.</p>
                </div>
            `,
            tip: "Bu sayfada gerçekten hassas bilgilerinizi girmeli misiniz? Güvenli bir bağlantı mı?"
        },
        {
            type: 'result',
            // GÜNCELLENMİŞ HTML KODU: SONUÇ
            html: `
                <div class="simulator-stage-box danger-result-box">
                    <h2><span class="result-warning-text">UYARI!</span></h2>
                    <p class="result-main-message">Bilgileriniz ele geçirildi!</p>
                    <h3 class="result-reason-title">Neden mi?</h3>
                    <ul class="result-list">
                        <li><span class="result-fail">Gönderici e-posta adresi bankanın gerçek adresi değildi.</span></li>
                        <li><span class="result-fail">Sitenin URL'si anlamsızdı ve güvenli (HTTPS) değildi.</span></li>
                        <li><span class="result-fail">Bankalar, şifrenizi veya kart numaranızı e-posta yoluyla asla talep etmez.</span></li>
                    </ul>
                    <button class="phishing-action-button" data-action="finish-scenario" style="background-color: #e74c3c;">Öğrendiklerimi Onaylıyorum</button>
                </div>
            `
        }
    ];

    function renderStage(stageIndex) {
        currentStage = stageIndex;
        if (currentStage < stages.length) {
            stageContainer.innerHTML = stages[currentStage].html;
            resetButton.style.display = 'none';
        } else {
            // Sonuç ekranı
            stageContainer.innerHTML = stages[stages.length - 1].html;
            resetButton.style.display = 'block';
        }
    }

    function handleAction(action) {
        if (action === 'next-step' || action === 'submit-data') {
            renderStage(currentStage + 1);
        } else if (action === 'finish-scenario') {
            alert("Tebrikler, Phishing tuzağını öğrendiniz!");
            renderStage(0); // Başa dön
        }
    }

    // Dinamik butonlara tıklama olayı ekleme
    stageContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('phishing-action-button')) {
            handleAction(e.target.dataset.action);
        }
    });

    // Reset butonu olay dinleyicisi
    resetButton.addEventListener('click', () => {
        renderStage(0);
    });

    // Simülasyonu başlat
    renderStage(0);
});

// --- Şifre Gücü Denetleyicisi Mantığı ---

const passwordInput = document.getElementById('password-input');
const strengthBar = document.getElementById('strength-bar');
const strengthLevel = document.getElementById('strength-level');
const passwordText = document.getElementById('password-text');
const checklist = document.getElementById('password-checklist');
const togglePassword = document.getElementById('toggle-password');

if (passwordInput) {
    
    // Şifreyi Göster/Gizle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
    });
    
    // Güç Hesaplama
    passwordInput.addEventListener('input', updateStrength);
}

function updateStrength() {
    const password = passwordInput.value;
    let score = 0;
    
    const checks = {
        length: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|]/.test(password)
    };

    // Puanlama mantığı
    if (checks.length) score += 20;
    if (checks.upper) score += 15;
    if (checks.lower) score += 15;
    if (checks.number) score += 20;
    if (checks.symbol) score += 30;

    // Uzunluk için ek bonus
    if (password.length > 15) score += 10;
    score = Math.min(score, 100); // %100'ü geçmesin

    // Bar ve Seviye Güncelleme
    strengthBar.style.width = score + '%';
    strengthBar.className = ''; // Tüm sınıfları temizle

    let levelText = 'Çok Zayıf';
    let barClass = 'strength-0';
    let barColor = '#e74c3c'; // Kırmızı

    if (score >= 20) { levelText = 'Zayıf'; barClass = 'strength-20'; barColor = '#f39c12'; }
    if (score >= 50) { levelText = 'Orta'; barClass = 'strength-50'; barColor = '#f1c40f'; }
    if (score >= 80) { levelText = 'Güçlü'; barClass = 'strength-80'; barColor = '#2ecc71'; }
    if (score === 100) { levelText = 'Çok Güçlü!'; barClass = 'strength-100'; barColor = '#1abc9c'; }

    strengthBar.classList.add(barClass);
    strengthBar.style.backgroundColor = barColor;
    strengthLevel.textContent = levelText;
    strengthLevel.style.color = barColor;
    passwordText.textContent = password.length > 0 ? password : '...';

    // Checklist Güncelleme
    Object.keys(checks).forEach(key => {
        const listItem = document.getElementById(`check-${key}`);
        if (checks[key]) {
            listItem.classList.add('checked-ok');
            listItem.classList.remove('checked-fail');
        } else {
            listItem.classList.remove('checked-ok');
            listItem.classList.add('checked-fail');
        }
    });
}

// İlk yüklemede çalıştır
if (passwordInput) {
    updateStrength();
}

// --- Yedekleme Karar Ağacı Mantığı ---

const decisionModule = document.getElementById('backup-decision');
if (decisionModule) {
    const decisionButtons = decisionModule.querySelectorAll('.decision-button');
    const feedbackBox = document.getElementById('decision-feedback');
    const scenarioBox = decisionModule.querySelector('.decision-scenario-box');

    decisionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const choice = button.dataset.choice;
            let resultHTML = '';

            // Tüm butonları devre dışı bırak
            decisionButtons.forEach(btn => btn.disabled = true);

            if (choice === 'B') {
                // Doğru cevap: 3-2-1 kuralına uyar.
                resultHTML = `
                    <h3 class="result-success">✅ Tebrikler! Verileriniz Güvende.</h3>
                    <p>Bu, **3-2-1 Kuralına** mükemmel bir örnektir:</p>
                    <ul class="result-list">
                        <li>**3 Kopya:** Orijinal dosya, harici disk ve bulut.</li>
                        <li>**2 Ortam:** Yerel disk ve bulut.</li>
                        <li>**1 Çevrimdışı/Ayrık:** Virüsün ulaşamadığı ayrılmış harici disk ve bulut.</li>
                    </ul>
                    <p>Virüs, sadece o an bağlı olan diske bulaşabilir. Diğer kopyalarınızdan verileri kurtarabilirsiniz.</p>
                `;
                feedbackBox.className = 'feedback-box result-success-box';
            } else if (choice === 'A') {
                // Yanlış cevap: Bağlı olduğu için virüs bulaşır.
                resultHTML = `
                    <h3 class="result-fail">❌ Verileriniz Risk Altında.</h3>
                    <p>Bu, **Çevrimdışı Kuralını (1)** ihlal eder. Virüs, bilgisayara bağlı olan harici diskinize de bulaşır ve oradaki verileri de şifreleyebilir. Şu anda tüm verileriniz şifrelenmiş olabilir.</p>
                    <p>Kural: Harici yedekler, işiniz bitince hemen bilgisayardan ayrılmalıdır.</p>
                `;
                feedbackBox.className = 'feedback-box result-fail-box';
            } else if (choice === 'C') {
                // Yanlış cevap: Yeterli kopya ve ortam yok.
                resultHTML = `
                    <h3 class="result-fail">❌ Çok Yetersiz Yedekleme.</h3>
                    <p>Bu, **3-2 Kuralını** ihlal eder. Sadece tek bir kopyanız (bulut) var. Eğer bulut hesabınız saldırıya uğrarsa veya kilitlenirse, tüm verileri kaybedebilirsiniz.</p>
                    <p>Kural: Her zaman en az iki farklı ortamda (yerel ve bulut) yedek tutun.</p>
                `;
                feedbackBox.className = 'feedback-box result-fail-box';
            }

            feedbackBox.innerHTML = resultHTML + '<button class="phishing-action-button" onclick="location.reload()" style="margin-top: 20px; background-color: #f39c12;">Tekrar Dene</button>';
            feedbackBox.style.display = 'block';
            scenarioBox.style.opacity = '0.5';
        });
    });
}

// --- Güvenlik Ayarları Kontrolü Mantığı (Erişilebilirlik) ---

const settingsModule = document.getElementById('settings-check');
if (settingsModule) {
    const settingButtons = settingsModule.querySelectorAll('.setting-button');
    const checkButton = document.getElementById('check-settings');
    const feedbackBox = document.getElementById('settings-feedback');

    // Doğru ayarlar (Açık olmalı)
    const correctSettings = ['lock', 'update', 'admin', 'backup'];
    let selectedSettings = new Set();

    settingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const setting = button.dataset.setting;
            const isSelected = button.classList.toggle('selected');
            
            if (isSelected) {
                selectedSettings.add(setting);
            } else {
                selectedSettings.delete(setting);
            }
            feedbackBox.style.display = 'none'; // Yeni seçimde geri bildirimi gizle
        });
    });

    checkButton.addEventListener('click', () => {
        let correctSelections = 0;
        let resultHTML = '<h3>Sonuçlar</h3><ul>';
        
        settingButtons.forEach(button => {
            const setting = button.dataset.setting;
            const isCorrect = correctSettings.includes(setting);
            const isSelected = selectedSettings.has(setting);
            let icon, className, message;

            if (isCorrect && isSelected) {
                // Doğru cevap: Açık ve işaretlendi
                icon = '✅';
                className = 'result-success';
                message = 'Doğru: Cihaz güvenliği için bu ayar **AÇIK** olmalıdır.';
                correctSelections++;
            } else if (!isCorrect && !isSelected) {
                // Doğru cevap: Kapalı ve işaretlenmedi
                icon = '✅';
                className = 'result-success';
                message = 'Doğru: Gereksiz riskleri önlemek için bu ayar **KAPALI** tutulmalıdır.';
                correctSelections++;
            } else {
                // Yanlış cevap
                icon = '❌';
                className = 'result-fail';
                message = isSelected 
                    ? 'Yanlış: Bu ayarın **KAPALI** tutulması gerekir (Gereksiz risk).' 
                    : 'Yanlış: Bu ayarın cihaz güvenliği için **AÇIK** olması gerekir.';
            }

            resultHTML += `<li class="${className}">${icon} <strong>${button.textContent}</strong>: ${message}</li>`;
        });

        const totalChecks = settingButtons.length;
        const score = Math.round((correctSelections / totalChecks) * 100);

        resultHTML += '</ul>';
        resultHTML += `<p style="text-align: center; font-weight: bold; margin-top: 15px;">Genel Başarı: %${score}</p>`;

        feedbackBox.innerHTML = resultHTML;
        feedbackBox.style.display = 'block';
    });
}

// --- Siber Zorbalık Yanıtı Mantığı (Bilinçli Kullanım) ---

const bullyingModule = document.getElementById('cyber-bullying-response');
if (bullyingModule) {
    const bullyingButtons = bullyingModule.querySelectorAll('.bullying-button');
    const feedbackBox = document.getElementById('bullying-feedback');
    const scenarioBox = bullyingModule.querySelector('.bullying-scenario-box');
    const correctChoice = 'B';

    bullyingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const choice = button.dataset.choice;
            let resultHTML = '';

            // Tüm butonları devre dışı bırak ve seçileni işaretle
            bullyingButtons.forEach(btn => {
                btn.disabled = true;
                if (btn.dataset.choice === choice) {
                    btn.classList.add('user-selection');
                }
                if (btn.dataset.choice === correctChoice) {
                    btn.classList.add('correct-answer');
                }
            });

            if (choice === correctChoice) {
                resultHTML = `
                    <h3 class="result-success">✅ Mükemmel Tepki!</h3>
                    <p>Bu, siber zorbalığa karşı verilebilecek en doğru ve güvenli yanıttır:</p>
                    <ul class="result-list">
                        <li>**Yanıt Verme (Görmezden Gelme):** Zorbaların istediği tepkiyi vermeyerek gücü ellerinden alırsınız.</li>
                        <li>**Kanıt Toplama (Ekran Görüntüsü):** Harekete geçmek gerektiğinde elinizde delil olur.</li>
                        <li>**Engelleme:** Zorbanın iletişimi kesilir.</li>
                        <li>**Bildirme:** Destek almak ve durumu çözmek için yetişkin yardımına başvurulur.</li>
                    </ul>
                `;
                feedbackBox.className = 'feedback-box result-success-box';
            } else {
                let reason = '';
                if (choice === 'A') {
                    reason = 'Zorbalığa yanıt vermek, zorbanın istediği tepkiyi vermek demektir. Bu, genellikle durumu tırmandırır ve daha fazla saldırıya yol açar.';
                } else if (choice === 'C') {
                    reason = 'Hesabı tamamen kapatmak bir çözüm olsa da, kanıt toplamadan ve durumu yetkililere bildirmeden kaçmak, zorbanın cezasız kalmasına neden olabilir ve çocukta mağduriyet hissini artırabilir.';
                }

                resultHTML = `
                    <h3 class="result-fail">❌ Bu Tepki İstenmeyen Sonuçlara Yol Açabilir.</h3>
                    <p>**Neden Yanlış:** ${reason}</p>
                    <p>Unutmayın: En iyi tepki **Durmak, Kaydetmek, Engellemek ve Bir Büyüğe Söylemektir.**</p>
                `;
                feedbackBox.className = 'feedback-box result-fail-box';
            }

            feedbackBox.innerHTML = resultHTML + '<button class="phishing-action-button" onclick="location.reload()" style="margin-top: 20px; background-color: #f39c12;">Tekrar Dene</button>';
            feedbackBox.style.display = 'block';
            scenarioBox.style.opacity = '0.5';
        });
    });
}
// --- Profil Dedektifi Mantığı ---
const profileDetector = document.getElementById('profile-detector');
if (profileDetector) {
    // Tıklanabilir alanları ve ilgili elementleri seçme
    const clickableInfos = document.querySelectorAll('.clickable-info');
    const feedbackBox = document.getElementById('detector-feedback');
    const checkButton = document.getElementById('check-results');
    const housePhoto = document.querySelector('.profile-image-section'); // Ev fotoğrafı alanı
    
    // Riskli alanların ID'leri ve neden riskli olduklarına dair açıklamalar
    const riskData = {
        'info-birthdate': 'Doğum tarihi, kimlik hırsızlığı ve hesap sıfırlama için kullanılabilir.',
        'info-school': 'Okul bilgisi, siber zorbalık veya çevrimdışı taciz için bir hedefe işaret eder.',
        'info-location': 'Mevcut şehir/konum bilgisi, gerçek zamanlı takip riskini artırır.',
        'profile-image-section': 'Evin/sokağın fotoğrafı, konum verisi içerir ve adresi kolayca ortaya çıkarabilir.'
    };

    let selections = {};

    function updateSelections(elementId, isSelected) {
        if (isSelected) {
            selections[elementId] = true;
        } else {
            delete selections[elementId];
        }
        
        // Yeni seçimde geri bildirimi gizle
        feedbackBox.style.display = 'none';
        feedbackBox.innerHTML = '';
    }

    // Bilgi kutularına tıklama olayı
    clickableInfos.forEach(info => {
        info.addEventListener('click', () => {
            const isSelected = info.classList.toggle('selected-risk');
            updateSelections(info.id, isSelected);
        });
    });

    // Profildeki Ev fotoğrafı alanına tıklama olayı
    housePhoto.addEventListener('click', () => {
        const isSelected = housePhoto.classList.toggle('selected-risk');
        updateSelections('profile-image-section', isSelected);
    });

    // Kontrol Et butonuna tıklama olayı
    checkButton.addEventListener('click', () => {
        const selectedCount = Object.keys(selections).length;
        const totalRisks = Object.keys(riskData).length;
        
        let feedbackHTML = '<h3>Sonuçlar</h3><ul>';
        
        // Kontrol: Kullanıcı tüm riskli 4 alanı seçti mi?
        const allCorrectlySelected = Object.keys(riskData).every(riskId => selections[riskId]);
        
        if (allCorrectlySelected && selectedCount === totalRisks) {
            feedbackHTML += `<li class="result-success">✅ Tebrikler! Tüm 4 riskli alanı doğru tespit ettiniz.</li>`;
        } else {
             feedbackHTML += `<li class="result-fail">❌ Eksik veya yanlış işaretlediğiniz yerler var. Tüm riskli alanlara (toplam 4 adet) dikkat edin.</li>`;
        }
        
        // Detaylı açıklamalar
        Object.keys(riskData).forEach(id => {
            const isSelected = selections[id];
            // Eğer işaretlenmesi gereken bir alanı işaretlemişse veya işaretlenmemesi gereken bir alanı işaretlememişse başarılı sayılır.
            const isCorrect = riskData.hasOwnProperty(id) ? isSelected : !isSelected;

            const className = isCorrect ? 'result-success' : 'result-fail';
            const icon = isCorrect ? '✅' : '❌';
            const displayId = id.replace('info-', '').replace('profile-image-section', 'Ev Fotoğrafı').toUpperCase();

            feedbackHTML += `<li class="${className}">${icon} <strong>${displayId}</strong>: ${riskData[id]}</li>`;
        });
        
        feedbackHTML += '</ul>';
        feedbackBox.innerHTML = feedbackHTML;
        feedbackBox.style.display = 'block';
    });

document.addEventListener('DOMContentLoaded', () => {
    // Sadece Phishing simülatörü olan sayfada çalıştır
    const simulatorContainer = document.getElementById('phishing-simulator');
    if (!simulatorContainer) return; 

    const stageContainer = document.getElementById('phishing-stage-container');
    const resetButton = document.getElementById('reset-phishing');
    let currentStage = 0;

    const stages = [
        {
          type: 'email',
            // GÜNCELLENMİŞ HTML KODU BAŞLANGICI
            html: `
                <div class="email-mockup-modern">
                    <div class="email-header-modern">
                        Kime: <span class="sender-mail-modern">destek@banka-guvenlik.com</span> | Konu: Bankanızdan Önemli Uyarı!
                    </div>
                    <div class="email-body-modern">
                        <p>Değerli müşterimiz,</p>
                        <p>Hesabınızda şüpheli işlemler tespit edilmiştir. Hesabınızın güvenliğini sağlamak için lütfen aşağıdaki butona tıklayarak bilgilerinizi güncelleyin.</p>
                        <div class="email-action-area-modern">
                            <button class="phishing-action-button" data-action="next-step">Hesabınızı Kontrol Edin</button>
                        </div>
                        <p class="warning-tip">İpucu: Gönderici e-posta adresini kontrol edin.</p>
                    </div>
                </div>
            `,
            // GÜNCELLENMİŞ HTML KODU SONU
            tip: "E-postanın gönderen adresini ve aciliyet içeren dilini incelediniz mi?"
        },
    
        {
            type: 'form',
            // GÜNCELLENMİŞ HTML KODU: FORM
            html: `
                <div class="simulator-stage-box">
                    <div class="browser-address-bar-modern">
                        <span class="warning-icon-modern">⚠️</span> <span class="url-text-modern">http://banka-secure.kfklfdlk.com</span>
                    </div>
                    <div class="browser-content-modern">
                        <h2>Hesabınızda şüpheli hareket tespit edildi.</h2>
                        <input type="text" placeholder="TC Kimlik / Kart No" />
                        <input type="password" placeholder="Şifreniz" />
                        <button class="phishing-action-button" data-action="submit-data">Giriş Yap</button>
                    </div>
                    <p class="warning-tip-box">İpucu: URL'nin HTTPS ile başlamamasına ve alan adına dikkat edin.</p>
                </div>
            `,
            tip: "Bu sayfada gerçekten hassas bilgilerinizi girmeli misiniz? Güvenli bir bağlantı mı?"
        },
        {
            type: 'result',
            // GÜNCELLENMİŞ HTML KODU: SONUÇ
            html: `
                <div class="simulator-stage-box danger-result-box">
                    <h2><span class="result-warning-text">UYARI!</span></h2>
                    <p class="result-main-message">Bilgileriniz ele geçirildi!</p>
                    <h3 class="result-reason-title">Neden mi?</h3>
                    <ul class="result-list">
                        <li><span class="result-fail">Gönderici e-posta adresi bankanın gerçek adresi değildi.</span></li>
                        <li><span class="result-fail">Sitenin URL'si anlamsızdı ve güvenli (HTTPS) değildi.</span></li>
                        <li><span class="result-fail">Bankalar, şifrenizi veya kart numaranızı e-posta yoluyla asla talep etmez.</span></li>
                    </ul>
                    <button class="phishing-action-button" data-action="finish-scenario" style="background-color: #e74c3c;">Öğrendiklerimi Onaylıyorum</button>
                </div>
            `
        }
    ];

    function renderStage(stageIndex) {
        currentStage = stageIndex;
        if (currentStage < stages.length) {
            stageContainer.innerHTML = stages[currentStage].html;
            resetButton.style.display = 'none';
        } else {
            // Sonuç ekranı
            stageContainer.innerHTML = stages[stages.length - 1].html;
            resetButton.style.display = 'block';
        }
    }

    function handleAction(action) {
        if (action === 'next-step' || action === 'submit-data') {
            renderStage(currentStage + 1);
        } else if (action === 'finish-scenario') {
            alert("Tebrikler, Phishing tuzağını öğrendiniz!");
            renderStage(0); // Başa dön
        }
    }

    // Dinamik butonlara tıklama olayı ekleme
    stageContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('phishing-action-button')) {
            handleAction(e.target.dataset.action);
        }
    });

    // Reset butonu olay dinleyicisi
    resetButton.addEventListener('click', () => {
        renderStage(0);
    });

    // Simülasyonu başlat
    renderStage(0);
});

// --- Şifre Gücü Denetleyicisi Mantığı ---

const passwordInput = document.getElementById('password-input');
const strengthBar = document.getElementById('strength-bar');
const strengthLevel = document.getElementById('strength-level');
const passwordText = document.getElementById('password-text');
const checklist = document.getElementById('password-checklist');
const togglePassword = document.getElementById('toggle-password');

if (passwordInput) {
    
    // Şifreyi Göster/Gizle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
    });
    
    // Güç Hesaplama
    passwordInput.addEventListener('input', updateStrength);
}

function updateStrength() {
    const password = passwordInput.value;
    let score = 0;
    
    const checks = {
        length: password.length >= 12,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|]/.test(password)
    };

    // Puanlama mantığı
    if (checks.length) score += 20;
    if (checks.upper) score += 15;
    if (checks.lower) score += 15;
    if (checks.number) score += 20;
    if (checks.symbol) score += 30;

    // Uzunluk için ek bonus
    if (password.length > 15) score += 10;
    score = Math.min(score, 100); // %100'ü geçmesin

    // Bar ve Seviye Güncelleme
    strengthBar.style.width = score + '%';
    strengthBar.className = ''; // Tüm sınıfları temizle

    let levelText = 'Çok Zayıf';
    let barClass = 'strength-0';
    let barColor = '#e74c3c'; // Kırmızı

    if (score >= 20) { levelText = 'Zayıf'; barClass = 'strength-20'; barColor = '#f39c12'; }
    if (score >= 50) { levelText = 'Orta'; barClass = 'strength-50'; barColor = '#f1c40f'; }
    if (score >= 80) { levelText = 'Güçlü'; barClass = 'strength-80'; barColor = '#2ecc71'; }
    if (score === 100) { levelText = 'Çok Güçlü!'; barClass = 'strength-100'; barColor = '#1abc9c'; }

    strengthBar.classList.add(barClass);
    strengthBar.style.backgroundColor = barColor;
    strengthLevel.textContent = levelText;
    strengthLevel.style.color = barColor;
    passwordText.textContent = password.length > 0 ? password : '...';

    // Checklist Güncelleme
    Object.keys(checks).forEach(key => {
        const listItem = document.getElementById(`check-${key}`);
        if (checks[key]) {
            listItem.classList.add('checked-ok');
            listItem.classList.remove('checked-fail');
        } else {
            listItem.classList.remove('checked-ok');
            listItem.classList.add('checked-fail');
        }
    });
}

// İlk yüklemede çalıştır
if (passwordInput) {
    updateStrength();
}

// --- Yedekleme Karar Ağacı Mantığı ---

const decisionModule = document.getElementById('backup-decision');
if (decisionModule) {
    const decisionButtons = decisionModule.querySelectorAll('.decision-button');
    const feedbackBox = document.getElementById('decision-feedback');
    const scenarioBox = decisionModule.querySelector('.decision-scenario-box');

    decisionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const choice = button.dataset.choice;
            let resultHTML = '';

            // Tüm butonları devre dışı bırak
            decisionButtons.forEach(btn => btn.disabled = true);

            if (choice === 'B') {
                // Doğru cevap: 3-2-1 kuralına uyar.
                resultHTML = `
                    <h3 class="result-success">✅ Tebrikler! Verileriniz Güvende.</h3>
                    <p>Bu, **3-2-1 Kuralına** mükemmel bir örnektir:</p>
                    <ul class="result-list">
                        <li>**3 Kopya:** Orijinal dosya, harici disk ve bulut.</li>
                        <li>**2 Ortam:** Yerel disk ve bulut.</li>
                        <li>**1 Çevrimdışı/Ayrık:** Virüsün ulaşamadığı ayrılmış harici disk ve bulut.</li>
                    </ul>
                    <p>Virüs, sadece o an bağlı olan diske bulaşabilir. Diğer kopyalarınızdan verileri kurtarabilirsiniz.</p>
                `;
                feedbackBox.className = 'feedback-box result-success-box';
            } else if (choice === 'A') {
                // Yanlış cevap: Bağlı olduğu için virüs bulaşır.
                resultHTML = `
                    <h3 class="result-fail">❌ Verileriniz Risk Altında.</h3>
                    <p>Bu, **Çevrimdışı Kuralını (1)** ihlal eder. Virüs, bilgisayara bağlı olan harici diskinize de bulaşır ve oradaki verileri de şifreleyebilir. Şu anda tüm verileriniz şifrelenmiş olabilir.</p>
                    <p>Kural: Harici yedekler, işiniz bitince hemen bilgisayardan ayrılmalıdır.</p>
                `;
                feedbackBox.className = 'feedback-box result-fail-box';
            } else if (choice === 'C') {
                // Yanlış cevap: Yeterli kopya ve ortam yok.
                resultHTML = `
                    <h3 class="result-fail">❌ Çok Yetersiz Yedekleme.</h3>
                    <p>Bu, **3-2 Kuralını** ihlal eder. Sadece tek bir kopyanız (bulut) var. Eğer bulut hesabınız saldırıya uğrarsa veya kilitlenirse, tüm verileri kaybedebilirsiniz.</p>
                    <p>Kural: Her zaman en az iki farklı ortamda (yerel ve bulut) yedek tutun.</p>
                `;
                feedbackBox.className = 'feedback-box result-fail-box';
            }

            feedbackBox.innerHTML = resultHTML + '<button class="phishing-action-button" onclick="location.reload()" style="margin-top: 20px; background-color: #f39c12;">Tekrar Dene</button>';
            feedbackBox.style.display = 'block';
            scenarioBox.style.opacity = '0.5';
        });
    });
}

// --- Güvenlik Ayarları Kontrolü Mantığı (Erişilebilirlik) ---

const settingsModule = document.getElementById('settings-check');
if (settingsModule) {
    const settingButtons = settingsModule.querySelectorAll('.setting-button');
    const checkButton = document.getElementById('check-settings');
    const feedbackBox = document.getElementById('settings-feedback');

    // Doğru ayarlar (Açık olmalı)
    const correctSettings = ['lock', 'update', 'admin', 'backup'];
    let selectedSettings = new Set();

    settingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const setting = button.dataset.setting;
            const isSelected = button.classList.toggle('selected');
            
            if (isSelected) {
                selectedSettings.add(setting);
            } else {
                selectedSettings.delete(setting);
            }
            feedbackBox.style.display = 'none'; // Yeni seçimde geri bildirimi gizle
        });
    });

    checkButton.addEventListener('click', () => {
        let correctSelections = 0;
        let resultHTML = '<h3>Sonuçlar</h3><ul>';
        
        settingButtons.forEach(button => {
            const setting = button.dataset.setting;
            const isCorrect = correctSettings.includes(setting);
            const isSelected = selectedSettings.has(setting);
            let icon, className, message;

            if (isCorrect && isSelected) {
                // Doğru cevap: Açık ve işaretlendi
                icon = '✅';
                className = 'result-success';
                message = 'Doğru: Cihaz güvenliği için bu ayar **AÇIK** olmalıdır.';
                correctSelections++;
            } else if (!isCorrect && !isSelected) {
                // Doğru cevap: Kapalı ve işaretlenmedi
                icon = '✅';
                className = 'result-success';
                message = 'Doğru: Gereksiz riskleri önlemek için bu ayar **KAPALI** tutulmalıdır.';
                correctSelections++;
            } else {
                // Yanlış cevap
                icon = '❌';
                className = 'result-fail';
                message = isSelected 
                    ? 'Yanlış: Bu ayarın **KAPALI** tutulması gerekir (Gereksiz risk).' 
                    : 'Yanlış: Bu ayarın cihaz güvenliği için **AÇIK** olması gerekir.';
            }

            resultHTML += `<li class="${className}">${icon} <strong>${button.textContent}</strong>: ${message}</li>`;
        });

        const totalChecks = settingButtons.length;
        const score = Math.round((correctSelections / totalChecks) * 100);

        resultHTML += '</ul>';
        resultHTML += `<p style="text-align: center; font-weight: bold; margin-top: 15px;">Genel Başarı: %${score}</p>`;

        feedbackBox.innerHTML = resultHTML;
        feedbackBox.style.display = 'block';
    });
}

// --- Siber Zorbalık Yanıtı Mantığı (Bilinçli Kullanım) ---

const bullyingModule = document.getElementById('cyber-bullying-response');
if (bullyingModule) {
    const bullyingButtons = bullyingModule.querySelectorAll('.bullying-button');
    const feedbackBox = document.getElementById('bullying-feedback');
    const scenarioBox = bullyingModule.querySelector('.bullying-scenario-box');
    const correctChoice = 'B';

    bullyingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const choice = button.dataset.choice;
            let resultHTML = '';

            // Tüm butonları devre dışı bırak ve seçileni işaretle
            bullyingButtons.forEach(btn => {
                btn.disabled = true;
                if (btn.dataset.choice === choice) {
                    btn.classList.add('user-selection');
                }
                if (btn.dataset.choice === correctChoice) {
                    btn.classList.add('correct-answer');
                }
            });

            if (choice === correctChoice) {
                resultHTML = `
                    <h3 class="result-success">✅ Mükemmel Tepki!</h3>
                    <p>Bu, siber zorbalığa karşı verilebilecek en doğru ve güvenli yanıttır:</p>
                    <ul class="result-list">
                        <li>**Yanıt Verme (Görmezden Gelme):** Zorbaların istediği tepkiyi vermeyerek gücü ellerinden alırsınız.</li>
                        <li>**Kanıt Toplama (Ekran Görüntüsü):** Harekete geçmek gerektiğinde elinizde delil olur.</li>
                        <li>**Engelleme:** Zorbanın iletişimi kesilir.</li>
                        <li>**Bildirme:** Destek almak ve durumu çözmek için yetişkin yardımına başvurulur.</li>
                    </ul>
                `;
                feedbackBox.className = 'feedback-box result-success-box';
            } else {
                let reason = '';
                if (choice === 'A') {
                    reason = 'Zorbalığa yanıt vermek, zorbanın istediği tepkiyi vermek demektir. Bu, genellikle durumu tırmandırır ve daha fazla saldırıya yol açar.';
                } else if (choice === 'C') {
                    reason = 'Hesabı tamamen kapatmak bir çözüm olsa da, kanıt toplamadan ve durumu yetkililere bildirmeden kaçmak, zorbanın cezasız kalmasına neden olabilir ve çocukta mağduriyet hissini artırabilir.';
                }

                resultHTML = `
                    <h3 class="result-fail">❌ Bu Tepki İstenmeyen Sonuçlara Yol Açabilir.</h3>
                    <p>**Neden Yanlış:** ${reason}</p>
                    <p>Unutmayın: En iyi tepki **Durmak, Kaydetmek, Engellemek ve Bir Büyüğe Söylemektir.**</p>
                `;
                feedbackBox.className = 'feedback-box result-fail-box';
            }

            feedbackBox.innerHTML = resultHTML + '<button class="phishing-action-button" onclick="location.reload()" style="margin-top: 20px; background-color: #f39c12;">Tekrar Dene</button>';
            feedbackBox.style.display = 'block';
            scenarioBox.style.opacity = '0.5';
        });
    });
}
// --- Profil Dedektifi Mantığı ---
const profileDetector = document.getElementById('profile-detector');
if (profileDetector) {
    // Tıklanabilir alanları ve ilgili elementleri seçme
    const clickableInfos = document.querySelectorAll('.clickable-info');
    const feedbackBox = document.getElementById('detector-feedback');
    const checkButton = document.getElementById('check-results');
    const housePhoto = document.querySelector('.profile-image-section'); // Ev fotoğrafı alanı
    
    // Riskli alanların ID'leri ve neden riskli olduklarına dair açıklamalar
    const riskData = {
        'info-birthdate': 'Doğum tarihi, kimlik hırsızlığı ve hesap sıfırlama için kullanılabilir.',
        'info-school': 'Okul bilgisi, siber zorbalık veya çevrimdışı taciz için bir hedefe işaret eder.',
        'info-location': 'Mevcut şehir/konum bilgisi, gerçek zamanlı takip riskini artırır.',
        'profile-image-section': 'Evin/sokağın fotoğrafı, konum verisi içerir ve adresi kolayca ortaya çıkarabilir.'
    };

    let selections = {};

    function updateSelections(elementId, isSelected) {
        if (isSelected) {
            selections[elementId] = true;
        } else {
            delete selections[elementId];
        }
        
        // Yeni seçimde geri bildirimi gizle
        feedbackBox.style.display = 'none';
        feedbackBox.innerHTML = '';
    }

    // Bilgi kutularına tıklama olayı
    clickableInfos.forEach(info => {
        info.addEventListener('click', () => {
            const isSelected = info.classList.toggle('selected-risk');
            updateSelections(info.id, isSelected);
        });
    });

    // Profildeki Ev fotoğrafı alanına tıklama olayı
    housePhoto.addEventListener('click', () => {
        const isSelected = housePhoto.classList.toggle('selected-risk');
        updateSelections('profile-image-section', isSelected);
    });

    // Kontrol Et butonuna tıklama olayı
    checkButton.addEventListener('click', () => {
        const selectedCount = Object.keys(selections).length;
        const totalRisks = Object.keys(riskData).length;
        
        let feedbackHTML = '<h3>Sonuçlar</h3><ul>';
        
        // Kontrol: Kullanıcı tüm riskli 4 alanı seçti mi?
        const allCorrectlySelected = Object.keys(riskData).every(riskId => selections[riskId]);
        
        if (allCorrectlySelected && selectedCount === totalRisks) {
            feedbackHTML += `<li class="result-success">✅ Tebrikler! Tüm 4 riskli alanı doğru tespit ettiniz.</li>`;
        } else {
             feedbackHTML += `<li class="result-fail">❌ Eksik veya yanlış işaretlediğiniz yerler var. Tüm riskli alanlara (toplam 4 adet) dikkat edin.</li>`;
        }
        
        // Detaylı açıklamalar
        Object.keys(riskData).forEach(id => {
            const isSelected = selections[id];
            // Eğer işaretlenmesi gereken bir alanı işaretlemişse veya işaretlenmemesi gereken bir alanı işaretlememişse başarılı sayılır.
            const isCorrect = riskData.hasOwnProperty(id) ? isSelected : !isSelected;

            const className = isCorrect ? 'result-success' : 'result-fail';
            const icon = isCorrect ? '✅' : '❌';
            const displayId = id.replace('info-', '').replace('profile-image-section', 'Ev Fotoğrafı').toUpperCase();

            feedbackHTML += `<li class="${className}">${icon} <strong>${displayId}</strong>: ${riskData[id]}</li>`;
        });
        
        feedbackHTML += '</ul>';
        feedbackBox.innerHTML = feedbackHTML;
        feedbackBox.style.display = 'block';
    });
}
}