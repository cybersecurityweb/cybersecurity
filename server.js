<<<<<<< HEAD
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
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    }
    return { count: 0, ips: [] };
}

// Verileri dosyaya yaz
function saveVisitorData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Sayaç endpoint'i
app.get('/count', (req, res) => {
    let visitorData = getVisitorData();
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // IP v6 adreslerini basitleştir
    if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.replace('::ffff:', '');
    }

    // IP adresi daha önce kaydedilmemişse sayacı artır
    if (!visitorData.ips.includes(clientIp)) {
        visitorData.count++;
        visitorData.ips.push(clientIp);
        saveVisitorData(visitorData);
    }

    res.json({ count: visitorData.count });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
=======
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
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    }
    return { count: 0, ips: [] };
}

// Verileri dosyaya yaz
function saveVisitorData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Sayaç endpoint'i
app.get('/count', (req, res) => {
    let visitorData = getVisitorData();
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // IP v6 adreslerini basitleştir
    if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.replace('::ffff:', '');
    }

    // IP adresi daha önce kaydedilmemişse sayacı artır
    if (!visitorData.ips.includes(clientIp)) {
        visitorData.count++;
        visitorData.ips.push(clientIp);
        saveVisitorData(visitorData);
    }

    res.json({ count: visitorData.count });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
>>>>>>> 89b5b77 (Son sayaç ve quiz düzeltmeleri.)
});