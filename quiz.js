// quiz.js
import { saveTestResult } from './firebase-setup.js';

// YENİ CEVAP SEÇENEKLERİ (7'li Ölçek)
// Bu değişkeni global olarak tanımlıyoruz, böylece tüm sorular kullanabilir.
const answerOptions = [
    { text: "Kesinlikle Katılmıyorum", value: 1, isReversed: false },
    { text: "Katılmıyorum", value: 2, isReversed: false },
    { text: "Kararsızım", value: 3, isReversed: false },
    { text: "Katılıyorum", value: 4, isReversed: false },
    { text: "Kesinlikle Katılıyorum", value: 5, isReversed: false },
];

// TERS MADDELER İÇİN PUANLAMA MANTIĞI:
// isReversed: true olan sorularda puanlama ters dönecektir (7 yerine 1, 1 yerine 7).

const quizQuestions = [
    // Gizlilik
    { question: "1-Siber ortamda paylaştığım kişisel bilgiler konusunda temkinliyimdir.", isReversed: false },
    { question: "2-Gerçek hayatta üçüncü şahıslarla paylaşmak istemediğim bilgi ve belgeleri siber ortamda da paylaşmam.", isReversed: false },
    { question: "3-Siber ortamda paylaştığım verilerin sadece gerekli kişilerce görüntülenmesini sağlarım.", isReversed: false },
    
    // Kontrol/Sahiplik
    { question: "4-Hesaplarıma ait şifrelerin güvenliği konusunda dikkatliyim.", isReversed: false },
    { question: "5-Şifremi oluştururken sembol, rakam ya da büyük küçük harflerden oluşan tahmini zor bir şifre seçerim.", isReversed: false },
    // DİKKAT: 6. SORU KODU YANLIŞ YERDEYDİ, BURAYA TAŞINDI.
    { question: "6-E-posta şifremin güvenliği için telefon doğrulaması hizmetini kullanırım.", isReversed: false }, 
    { question: "7-Cevabını hatırlayacağım bir güvenlik sorusu seçmeye özen gösteririm.", isReversed: false },
    { question: "8-Kredi kartı bilgilerimin kaydedilmemiş olmasına dikkat ederim.", isReversed: false },
    
    // Bütünlük
    { question: "9-Siber ortamda veri saklamak güvenli değildir.", isReversed: false },
    { question: "10-Siber ortamda sakladığım bilgi ve belgeler kaybolabilir ya da silinebilir.", isReversed: false },
    { question: "11-Siber ortamda veri paylaşımı yapmak herhangi bir risk içermez.", isReversed: true }, // TERS MADDE
    { question: "12-Siber ortamda saklanan bilgi ve belgelere üçüncü şahısların erişme olasılığı vardır.", isReversed: false },
    
    // Gerçeklik
    { question: "13-Tanımadığım kişilerden gelen e-postalardaki linkleri ve eklentileri açarım.", isReversed: true }, // TERS MADDE
    { question: "14-Girdiğim web sitesinin güvenlik sertifikası olmadığı yönünde bildirim gelse de kullanmaya devam ederim.", isReversed: true }, // TERS MADDE
    { question: "15-E-postama gelen istenmeyen (spam) postaları açtığım olmuştur.", isReversed: true }, // TERS MADDE
    { question: "16-E-postama gelen müşteri edinme/oltalama amaçlı postaları açtığım olmuştur.", isReversed: true }, // TERS MADDE
    { question: "17-Belirsiz kaynaklardan gelen bağlantıları (linkleri) ve dosyaları açtığım olmuştur.", isReversed: true }, // TERS MADDE
    
    // Erişilebilirlik
    { question: "18-Cihazımda güncel bir anti virüs programı var.", isReversed: false },
    { question: "19-Cihazımı düzenli olarak anti virüs programı ile taratırım.", isReversed: false },
    { question: "20-Cihazıma kurulu gelen güvenlik duvarı açık.", isReversed: false },
    { question: "21-İnternetten indirdiğim dosyaları cihazımda yüklü anti virüs programı olmasa da açarım.", isReversed: true }, // TERS MADDE

    // Fayda
    { question: "22-Siber ortamda sosyal medya uygulamalarını bilgi paylaşımı için kullanırım.", isReversed: false },
    { question: "23-Günlük hayatta karşılaştığım problemleri çözmek için siber ortamı yaygın olarak kullanırım.", isReversed: false },
    { question: "24-Siber ortamda sunulan hizmetlerden bilgi yönetimi (bilgiyi elde etmek, saklamak, paylaşmak ve kullanmak) için faydalanırım.", isReversed: false }
];


let currentQuestionIndex = 0;
let userAnswers = {};

const questionContainer = document.getElementById('question-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-btn');

function getScoreValue(rawScore, isReversed) {
    if (isReversed) {
        // Puanı ters çevir: 1 -> 7, 7 -> 1 (Toplam puan 8'den çıkarılır)
        return 8 - rawScore; 
    }
    return rawScore;
}

function loadQuestion() {
    const questionData = quizQuestions[currentQuestionIndex];
    questionContainer.innerHTML = ''; 

    const questionElement = document.createElement('h3');
    questionElement.textContent = questionData.question;
    questionContainer.appendChild(questionElement);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    answerOptions.forEach(option => {
        const input = document.createElement('input');
        input.type = 'radio';
        // HTML'de saklanan değer, her zaman 1-7 arasındaki ham değerdir
        input.value = option.value; 
        
        input.id = `q${currentQuestionIndex}-opt${option.value}`;
        input.name = `question-${currentQuestionIndex}`;
        
        input.addEventListener('change', () => {
            // Cevaplar objesinde PUAN değeri saklanmalı, ham değer değil
            const score = getScoreValue(option.value, questionData.isReversed);
            userAnswers[currentQuestionIndex] = score;
            updateNavigationButtons();
        });
        
        // Kullanıcının daha önce seçtiği HAM değeri (1-7) kontrol et
        // Geri butonu ile gelince seçimin kalması için gerekli
        if (userAnswers.hasOwnProperty(currentQuestionIndex)) {
            // Ham değeri ters çevirerek input.value ile karşılaştır
            const currentRawValue = questionData.isReversed ? 8 - userAnswers[currentQuestionIndex] : userAnswers[currentQuestionIndex];
            if (currentRawValue == option.value) {
                input.checked = true;
            }
        }
        
        const label = document.createElement('label');
        label.htmlFor = `q${currentQuestionIndex}-opt${option.value}`;
        label.textContent = option.text;
        label.className = 'answer-label';

        optionsContainer.appendChild(input);
        optionsContainer.appendChild(label);
        optionsContainer.appendChild(document.createElement('br'));
    });

    questionContainer.appendChild(optionsContainer);
    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevButton.disabled = currentQuestionIndex === 0;

    const isAnswered = userAnswers.hasOwnProperty(currentQuestionIndex);
    const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
    
    nextButton.disabled = isLastQuestion || !isAnswered;
    
    submitButton.style.display = isLastQuestion && isAnswered ? 'inline-block' : 'none';
}

function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

async function submitQuiz() {
    const totalQuestions = quizQuestions.length;
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < totalQuestions) {
        alert("Lütfen tüm soruları cevaplayın!");
        return;
    }

    let totalScore = 0;
    // userAnswers objesinde zaten PUANLANMIŞ değerler var.
    for (const key in userAnswers) {
        totalScore += userAnswers[key]; 
    }

    // Test Tipini Belirleme ve Veriyi Kaydetme
    // Basit tutmak için "post" kullanıyoruz.
    const testType = "post"; 
    
    const saveSuccess = await saveTestResult(testType, userAnswers, totalScore);

    questionContainer.innerHTML = `
        <h2>Test Tamamlandı!</h2>
        <p>Tüm soruları cevapladınız. ${totalQuestions} sorudan toplam puanınız: ${totalScore}.</p>
        ${saveSuccess ? '<p style="color:#FFD700;">Sonuçlarınız başarıyla kaydedildi! Admin paneli için istatistikler toplanıyor.</p>' : '<p style="color:red;">Kayıt başarısız oldu. Lütfen tekrar deneyin.</p>'}
        <a href="index.html" class="action-button" style="margin-top: 20px;">Ana Sayfaya Dön</a>
    `;
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    submitButton.style.display = 'none';
}

nextButton.addEventListener('click', nextQuestion);
prevButton.addEventListener('click', prevQuestion);
submitButton.addEventListener('click', submitQuiz);

document.addEventListener('DOMContentLoaded', loadQuestion);