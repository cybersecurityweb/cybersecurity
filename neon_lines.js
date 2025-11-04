// neon_lines.js - Sadece sarı/altın tonları ile siyah arka plan üzerinde çalışan stabil sürüm

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neon-lines');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Canvas'ı her durumda siyah tut
    canvas.style.backgroundColor = '#000';

    let lines = [];
    const numLines = 25;

    const colors = ['#FFD700', '#FFA500']; // Altın tonları

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
            this.alphaDirection = 1;
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.dx * this.length, this.y + this.dy * this.length);

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

        update() {
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;

            if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
                this.reset();
            }

            // Neon yanıp sönme efekti
            if (this.alpha < 0.8 && this.alphaDirection === 1) {
                this.alpha += 0.005;
            } else if (this.alpha > 0.1 && this.alphaDirection === -1) {
                this.alpha -= 0.005;
            } else if (this.alpha >= 0.8) {
                this.alphaDirection = -1;
            } else if (this.alpha <= 0.1) {
                this.alphaDirection = 1;
            }
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.dx = (Math.random() - 0.5) * 2;
            this.dy = (Math.random() - 0.5) * 2;
            this.length = Math.random() * 50 + 20;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = 0;
            this.alphaDirection = 1;
        }
    }

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

    function animate() {
    requestAnimationFrame(animate);

    // Arka planı tam siyah yap — sararma engellenir
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon efekt için sadece çizgileri karıştır
    ctx.globalCompositeOperation = 'lighter';
    lines.forEach(line => {
        line.update();
        line.draw();
    });
}


    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });

    init();
    animate();
});
