const express = require('express');
const app = express();
const fs = require('fs');

const KEY_FILE = 'keys.json';
const SECRET = 'SIGMA2026-MELAYU-HUB'; // TUKAR NI!

function loadKeys() {
    if (!fs.existsSync(KEY_FILE)) return {};
    return JSON.parse(fs.readFileSync(KEY_FILE));
}

function saveKeys(keys) {
    fs.writeFileSync(KEY_FILE, JSON.stringify(keys));
}

function generateKey() {
    return [...Array(30)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
}

// =====================
// ROUTE: Generate Key
// =====================
app.get('/getkey', (req, res) => {
    const token = req.query.token;

    // Kalau takde token atau token salah = reject
    if (!token || token !== SECRET) {
        return res.send(`
            <h1 style="color:red">❌ Akses Ditolak!</h1>
            <p>Kau kena guna link yang betul untuk dapat key.</p>
            <a href="https://linkvertise.com/XXXXX/get-key">Klik sini untuk dapat key</a>
        `);
    }

    const keys = loadKeys();
    const newKey = generateKey();

    keys[newKey] = {
        used: false,
        created_at: Date.now(),
        expires_at: Date.now() + (12 * 60 * 60 * 1000) // 12 jam
    };

    saveKeys(keys);

    res.send(`
        <h1>✅ Key Kau:</h1>
        <h2 style="color:green">${newKey}</h2>
        <p>Key ni expire dalam 12 jam!</p>
        <p>Copy key ni dan masukkan dalam executor.</p>
    `);
});

// =====================
// ROUTE: Verify Key
// =====================
app.get('/verify', (req, res) => {
    const key = req.query.key;
    const keys = loadKeys();

    if (!key || !keys[key]) {
        return res.json({ valid: false, reason: 'Key tidak wujud' });
    }

    const keyData = keys[key];

    if (Date.now() > keyData.expires_at) {
        delete keys[key];
        saveKeys(keys);
        return res.json({ valid: false, reason: 'Key dah expire' });
    }

    return res.json({ valid: true, reason: 'Key sah!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
