const express = require('express');
const cors = require('cors'); // CORS hatasını engellemek için
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dataFile = path.join(__dirname, 'visitors.json');

app.use(cors()); // CORS'u etkinleştirin

// Başlangıç verilerini oluştur veya dosyadan oku
function getVisitorData() {
    if (fs.existsSync(dataFile)) {
        try {
            const data = fs.readFileSync(dataFile, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error("visitors.json okuma hatası, sıfırdan başlıyor:", e);
            // Hata oluşursa sıfırdan başla
            return { count: 0, ips: [] };
        }
    }
    // Dosya yoksa sıfırdan başla
    return { count: 0, ips: [] };
}

// Verileri dosyaya yaz
function saveVisitorData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Sayaç endpoint'i
// Müşteri tarafı (client.js), bu endpoint'e istek göndermelidir.
// Örneğin: https://yourrenderdeploy.com/visitors
app.get('/visitors', (req, res) => {
    let visitorData = getVisitorData();
    // Render gibi platformlarda 'x-forwarded-for' genellikle en doğru IP'yi verir
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // IP v6 adreslerini basitleştir
    if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.replace('::ffff:', '');
    }

    // IP adresi daha önce kaydedilmemişse sayacı artır
    // NOT: Yerel testte (localhost:3000) IP genellikle ::1 veya 127.0.0.1 olacağı için sürekli artabilir.
    // Ancak Render gibi canlı bir ortamda bu, istemcinin (kullanıcının) gerçek IP'si olacaktır.
    if (!visitorData.ips.includes(clientIp)) {
        visitorData.count++;
        visitorData.ips.push(clientIp);
        saveVisitorData(visitorData);
    }

    // Frontend'e sadece mevcut sayacı gönder
    res.json({ count: visitorData.count });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});