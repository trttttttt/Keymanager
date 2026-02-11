const express = require('express');
const app = express();
const fs = require('fs');

const KEY_FILE = 'keys.json';
const TOKEN_FILE = 'tokens.json';

function loadKeys() {
    if (!fs.existsSync(KEY_FILE)) return {};
    return JSON.parse(fs.readFileSync(KEY_FILE));
}

function saveKeys(keys) {
    fs.writeFileSync(KEY_FILE, JSON.stringify(keys));
}

function loadTokens() {
    if (!fs.existsSync(TOKEN_FILE)) return {};
    return JSON.parse(fs.readFileSync(TOKEN_FILE));
}

function saveTokens(tokens) {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
}

function generateKey() {
    return [...Array(30)].map(() => Math.random().toString(36)[2]).join('').toUpperCase();
}

function generateToken() {
    return [...Array(40)].map(() => Math.random().toString(36)[2]).join('');
}

// =====================
// ROUTE: Linkvertise redirect ke sini dulu
// Jana token sekali guna
// =====================
app.get('/start', (req, res) => {
    const tokens = loadTokens();
    const newToken = generateToken();

    // Token expire dalam 10 minit
    tokens[newToken] = {
        used: false,
        expires_at: Date.now() + (10 * 60 * 1000)
    };

    saveTokens(tokens);

    // Redirect ke Linkvertise dengan token
    res.redirect(`https://linkvertise.com/XXXXX/get-key?r=${newToken}`);
});

// =====================
// ROUTE: Lepas complete Linkvertise
// =====================
app.get('/getkey', (req, res) => {
    const token = req.query.token;
    const tokens = loadTokens();

    // Semak token wujud
    if (!token || !tokens[token]) {
        return res.send(`
            <h1 style="color:red">❌ Akses Ditolak!</h1>
            <p>Guna link yang betul untuk dapat key.</p>
        `);
    }

    // Semak token dah guna
    if (tokens[token].used) {
        return res.send(`
            <h1 style="color:red">❌ Link Dah Digunakan!</h1>
            <p>Setiap link hanya boleh guna sekali.</p>
        `);
    }

    // Semak token expire
    if (Date.now() > tokens[token].expires_at) {
        delete tokens[token];
        saveTokens(tokens);
        return res.send(`
            <h1 style="color:red">❌ Link Dah Expire!</h1>
            <p>Ulang semula dari awal.</p>
        `);
    }

    // Mark token sebagai dah guna
    tokens[token].used = true;
    saveTokens(tokens);

    // Jana key
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

    if (Date.now() > keys[key].expires_at) {
        delete keys[key];
        saveKeys(keys);
        return res.json({ valid: false, reason: 'Key dah expire' });
    }

    return res.json({ valid: true, reason: 'Key sah!' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
