// neon_lines.js - BİRLEŞTİRİLMİŞ VE TEMİZLENMİŞ KOD

// 'neon-lines' yerine 'neon-canvas' id'sini kullandığımızı varsayarak düzeltildi.
// HTML dosyanıza <canvas id="neon-canvas"></canvas> eklediyseniz, bu çalışır.
const canvas = document.getElementById('neon-canvas'); 
// Eğer HTML'de 'neon-lines' id'sini kullanıyorsanız, yukarıdaki satırı: 
// const canvas = document.getElementById('neon-lines'); olarak bırakın.

// Canvas elementi bulunamazsa kodun hata vermesini engelle
// neon_lines.js dosyasındaki TÜM KODU bu yapının içine alın:

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neon-lines');
    
    // Eğer canvas elementi bulunamazsa (örneğin bazı sayfalarda yoksa)
    if (!canvas) {
        return; 
    }
    
    // Buraya getContext('2d') ile başlayan eski neon_lines.js kodunuzun geri kalanını yapıştırın
    const ctx = canvas.getContext('2d');
    
    // ... scriptin geri kalanı ...

    if (!canvas) {
    console.error("Canvas elementi 'neon-canvas' veya 'neon-lines' id'si ile bulunamadı. Lütfen index.html dosyanızı kontrol edin.");
} else {
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
            
            // Hex rengini RGBA'ya çevirme mantığı
            const r = parseInt(this.color.slice(1, 3), 16);
            const g = parseInt(this.color.slice(3, 5), 16);
            const b = parseInt(this.color.slice(5, 7), 16);
            
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
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
            if (this.alpha < 0.8 && this.alphaDirection === 1) {
                this.alpha += 0.005;
            } else if (this.alpha > 0.1 && this.alphaDirection === -1) {
                 this.alpha -= 0.005;
            } else if (this.alpha >= 0.8) {
                // Maksimum şeffaflığa ulaşınca azalmaya başla
                this.alphaDirection = -1;
            } else if (this.alpha <= 0.1) {
                // Minimum şeffaflığa ulaşınca artmaya başla
                this.alphaDirection = 1;
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
            this.alphaDirection = 1; // 1: artır, -1: azalt
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
        // Arkaplanı hafifçe silerek iz bırakma (tail) efekti oluşturur
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    animate();
}
});
