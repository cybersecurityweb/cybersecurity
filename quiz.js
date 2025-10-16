// quiz.js dosyasının YENİ içeriği (Ana Klasöre Yüklenecek)

const quizQuestions = [
    {
        question: "1. Kişisel fotoğraflarımı veya konumumu paylaşırken, bunların dijital ayak izimi oluşturduğunu ve ileride karşıma çıkabileceğini düşünüyorum.",
    },
    {
        question: "2. Kullandığım tüm çevrimiçi hesaplar için güçlü, karmaşık şifreler oluşturur ve bunları düzenli olarak değiştiririm.",
    },
    {
        question: "3. Tanımadığım bir kaynaktan gelen ve aciliyet belirten e-postalardaki linklere tıklamadan önce daima gönderici adresini ve URL'yi kontrol ederim.",
    },
    {
        question: "4. İnternetteki bir haberin veya bilginin doğru olup olmadığını anlamak için birden fazla güvenilir kaynağı araştırırım.",
    },
    {
        question: "5. Sosyal medya veya çevrimiçi oyunlarda tanıştığım kişisel bilgilerimi paylaşmaktan veya onlarla özel konuşmalar yapmaktan kaçınırım.",
    }
];

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

function submitQuiz() {
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
    
    questionContainer.innerHTML = `
        <h2>Test Tamamlandı!</h2>
        <p>Tüm soruları cevapladınız. ${totalQuestions} sorudan toplam puanınız: ${totalScore}.</p>
        <p>Projeniz başarılı bir şekilde tamamlanmıştır!</p>
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