const express = require('express');
const app = express();
const fs = require('fs');

const KEY_FILE = 'keys.json';

// Load keys dari file
function loadKeys() {
    if (!fs.existsSync(KEY_FILE)) return {};
    return JSON.parse(fs.readFileSync(KEY_FILE));
}

// Save keys ke file
function saveKeys(keys) {
    fs.writeFileSync(KEY_FILE, JSON.stringify(keys));
}

// Generate random key
function generateKey() {
    return [...Array(30)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
}

// =====================
// ROUTE 1: Generate Key
// Linkvertise redirect ke sini
// =====================
app.get('/getkey', (req, res) => {
    const keys = loadKeys();
    const newKey = generateKey();

    keys[newKey] = {
        used: false,
        created_at: Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 jam
    };

    saveKeys(keys);

    // Tunjuk key kat user
    res.send(`
        <h1>Key Kau:</h1>
        <h2 style="color:green">${newKey}</h2>
        <p>Key ni expire dalam 24 jam!</p>
        <p>Copy key ni dan masukkan dalam executor.</p>
    `);
});

// =====================
// ROUTE 2: Verify Key
// Script executor call sini
// =====================
app.get('/verify', (req, res) => {
    const key = req.query.key;
    const keys = loadKeys();

    if (!key || !keys[key]) {
        return res.json({ valid: false, reason: 'Key tidak wujud' });
    }

    const keyData = keys[key];

    // Check expire
    if (Date.now() > keyData.expires_at) {
        delete keys[key];
        saveKeys(keys);
        return res.json({ valid: false, reason: 'Key dah expire' });
    }

    return res.json({ valid: true, reason: 'Key sah!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
