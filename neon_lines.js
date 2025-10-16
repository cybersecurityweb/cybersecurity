<<<<<<< HEAD
const canvas = document.getElementById('neon-lines');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lines = [];
const numLines = 25;
const colors = ['#FFD700', '#FF4500', '#FFC0CB']; // Sarı, turuncu, pembe tonları

// Çizgi nesnesini oluştur
class NeonLine {
    constructor(x, y, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.length = Math.random() * 50 + 20;
        this.color = color;
        this.alpha = 0;
        this.speed = Math.random() * 0.5 + 0.1;
    }

    // Çizgiyi çiz
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.dx * this.length, this.y + this.dy * this.length);
        ctx.strokeStyle = `rgba(${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.closePath();
    }

    // Çizgiyi güncelle
    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Sayfa dışına çıkınca yeniden başlat
        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
            this.reset();
        }

        // Şeffaflığı yavaşça artır ve azalt
        if (this.alpha < 0.8) {
            this.alpha += 0.005;
        } else {
            this.alpha -= 0.005;
        }
    }

    // Çizgiyi rastgele bir noktadan yeniden başlat
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.length = Math.random() * 50 + 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 0;
    }
}

// Çizgileri oluştur
function init() {
    lines = [];
    for (let i = 0; i < numLines; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const dx = (Math.random() - 0.5) * 2;
        const dy = (Math.random() - 0.5) * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        lines.push(new NeonLine(x, y, dx, dy, color));
    }
}

// Animasyon döngüsü
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
        line.update();
        line.draw();
    });
}

// Yeniden boyutlandırma
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
=======
const canvas = document.getElementById('neon-lines');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lines = [];
const numLines = 25;
const colors = ['#FFD700', '#FF4500', '#FFC0CB']; // Sarı, turuncu, pembe tonları

// Çizgi nesnesini oluştur
class NeonLine {
    constructor(x, y, dx, dy, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.length = Math.random() * 50 + 20;
        this.color = color;
        this.alpha = 0;
        this.speed = Math.random() * 0.5 + 0.1;
    }

    // Çizgiyi çiz
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.dx * this.length, this.y + this.dy * this.length);
        ctx.strokeStyle = `rgba(${parseInt(this.color.slice(1, 3), 16)}, ${parseInt(this.color.slice(3, 5), 16)}, ${parseInt(this.color.slice(5, 7), 16)}, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.closePath();
    }

    // Çizgiyi güncelle
    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Sayfa dışına çıkınca yeniden başlat
        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
            this.reset();
        }

        // Şeffaflığı yavaşça artır ve azalt
        if (this.alpha < 0.8) {
            this.alpha += 0.005;
        } else {
            this.alpha -= 0.005;
        }
    }

    // Çizgiyi rastgele bir noktadan yeniden başlat
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;
        this.length = Math.random() * 50 + 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = 0;
    }
}

// Çizgileri oluştur
function init() {
    lines = [];
    for (let i = 0; i < numLines; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const dx = (Math.random() - 0.5) * 2;
        const dy = (Math.random() - 0.5) * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        lines.push(new NeonLine(x, y, dx, dy, color));
    }
}

// Animasyon döngüsü
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
        line.update();
        line.draw();
    });
}

// Yeniden boyutlandırma
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
>>>>>>> 89b5b77 (Son sayaç ve quiz düzeltmeleri.)
animate();