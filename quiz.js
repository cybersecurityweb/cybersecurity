// quiz.js dosyasının YENİ içeriği (Ana Klasöre Yüklenecek)

import { saveTestResult } from './firebase-setup.js';

const quizQuestions = [
    // Gizlilik
    {
        question: "1-Siber ortamda paylaştığım kişisel bilgiler konusunda temkinliyimdir.",
      
    },
    {
        question: "2-Gerçek hayatta üçüncü şahıslarla paylaşmak istemediğim bilgi ve belgeleri siber ortamda da paylaşmam.",
        
    },
    {
        question: "3-Siber ortamda paylaştığım verilerin sadece gerekli kişilerce görüntülenmesini sağlarım.",
       
    },
    
    // Kontrol/Sahiplik
    {
        question: "4-Hesaplarıma ait şifrelerin güvenliği konusunda dikkatliyim.",
     
    },
    {
        question: "5-Şifremi oluştururken sembol, rakam ya da büyük küçük harflerden oluşan tahmini zor bir şifre seçerim.",
      
    
        question: "6-E-posta şifremin güvenliği için telefon doğrulaması hizmetini kullanırım.",
     
    },
    {
        question: "7-Cevabını hatırlayacağım bir güvenlik sorusu seçmeye özen gösteririm.",
      
    },
    {
        question: "8-Kredi kartı bilgilerimin kaydedilmemiş olmasına dikkat ederim.",
      
    },
    
    // Bütünlük
    {
        question: "9-Siber ortamda veri saklamak güvenli değildir.",
     
    },
    {
        question: "10-Siber ortamda sakladığım bilgi ve belgeler kaybolabilir ya da silinebilir.",
       
    },
    {
        question: "11-Siber ortamda veri paylaşımı yapmak herhangi bir risk içermez.",
       
    },
    {
        question: "12-Siber ortamda saklanan bilgi ve belgelere üçüncü şahısların erişme olasılığı vardır.",
      
    },
    
    // Gerçeklik
    {
        question: "13-Tanımadığım kişilerden gelen e-postalardaki linkleri ve eklentileri açarım.",
      
    },
    {
        question: "14-Girdiğim web sitesinin güvenlik sertifikası olmadığı yönünde bildirim gelse de kullanmaya devam ederim.",
      
    },
    {
        question: "15-E-postama gelen istenmeyen (spam) postaları açtığım olmuştur.",
      
    },
    {
        question: "16-E-postama gelen müşteri edinme/oltalama amaçlı postaları açtığım olmuştur.",
   
    },
    {
        question: "17-Belirsiz kaynaklardan gelen bağlantıları (linkleri) ve dosyaları açtığım olmuştur.",
     
  
    },
    
    // Erişilebilirlik
    {
        question: "18-Cihazımda güncel bir anti virüs programı var.",
 
    },
    {
        question: "19-Cihazımı düzenli olarak anti virüs programı ile taratırım.",

    },
    {
        question: "20-Cihazıma kurulu gelen güvenlik duvarı açık.",
  
    },
    {
        question: "21-İnternetten indirdiğim dosyaları cihazımda yüklü anti virüs programı olmasa da açarım.",

    },

    // Fayda
    {
        question: "22-Siber ortamda sosyal medya uygulamalarını bilgi paylaşımı için kullanırım.",

    },
    {
        question: "23-Günlük hayatta karşılaştığım problemleri çözmek için siber ortamı yaygın olarak kullanırım.",

    },
    {
        question: "24-Siber ortamda sunulan hizmetlerden bilgi yönetimi (bilgiyi elde etmek, saklamak, paylaşmak ve kullanmak) için faydalanırım.",

        
    }
];

// Bu diziyi projenizdeki mevcut quizQuestions değişkeniyle DEĞİŞTİRİN.
// Fonksiyonlar ve diğer kodlar aynı kalmalıdır.

// YENİ CEVAP SEÇENEKLERİ (7'li Ölçek)
const answerOptions = [
    { text: "Kesinlikle Katılmıyorum", value: 1 },
    { text: "Katılmıyorum", value: 2 },
    { text: "Kısmen Katılmıyorum", value: 3 },
    { text: "Ne Katılıyorum Ne De Katılmıyorum", value: 4 },
    { text: "Kısmen Katılıyorum", value: 5 },
    { text: "Katılıyorum", value: 6 },
    { text: "Kesinlikle Katılıyorum", value: 7 }
];
// NOT: value değerleri 1'den 7'ye kadar puanlama için ayarlanmıştır.

let currentQuestionIndex = 0;
let userAnswers = {};

const questionContainer = document.getElementById('question-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-btn');

function loadQuestion() {
    // ... [Önceki kodda verilen loadQuestion fonksiyonunun tam içeriği]
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
        input.id = `q${currentQuestionIndex}-opt${option.value}`;
        input.name = `question-${currentQuestionIndex}`;
        input.value = option.value;
        input.addEventListener('change', () => {
            userAnswers[currentQuestionIndex] = option.value;
            updateNavigationButtons();
        });
        
        if (userAnswers[currentQuestionIndex] == option.value) {
            input.checked = true;
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
    // ... [Önceki kodda verilen updateNavigationButtons fonksiyonunun tam içeriği]
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

// quiz.js içindeki submitQuiz fonksiyonunun YENİ HALİ

async function submitQuiz() {
    const totalQuestions = quizQuestions.length;
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < totalQuestions) {
        alert("Lütfen tüm soruları cevaplayın!");
        return;
    }

    let totalScore = 0;
    for (const key in userAnswers) {
        totalScore += parseInt(userAnswers[key]);
    }

    // --- YENİ ADIM: Test Tipini Belirleme ve Veriyi Kaydetme ---
    // NOT: Basit tutmak için her zaman "post" (Son Test) olarak kaydederiz, 
    // ancak gerçek uygulamada ön testte mi son testte mi olunduğu bilinmelidir.
    const testType = "post"; 
    
    const saveSuccess = await saveTestResult(testType, userAnswers, totalScore);
    // --- YENİ ADIM SONU ---

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