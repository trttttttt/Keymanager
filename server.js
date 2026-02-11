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

app.get('/start', (req, res) => {
    const tokens = loadTokens();
    const newToken = generateToken();
    tokens[newToken] = {
        used: false,
        expires_at: Date.now() + (10 * 60 * 1000)
    };
    saveTokens(tokens);
    res.redirect('https://link-hub.net/3411951/vB1f7MYaeneJ?r=https://keymanager-production-f858.up.railway.app/getkey?token=' + newToken);
});

app.get('/getkey', (req, res) => {
    const token = req.query.token;
    const tokens = loadTokens();

    if (!token || !tokens[token]) {
        return res.send('<h1 style="color:red">Akses Ditolak!</h1><p>Guna link yang betul.</p><a href="https://keymanager-production-f858.up.railway.app/start">Cuba semula</a>');
    }

    if (tokens[token].used) {
        return res.send('<h1 style="color:red">Link Dah Digunakan!</h1><a href="https://keymanager-production-f858.up.railway.app/start">Cuba semula</a>');
    }

    if (Date.now() > tokens[token].expires_at) {
        delete tokens[token];
        saveTokens(tokens);
        return res.send('<h1 style="color:red">Link Dah Expire!</h1><a href="https://keymanager-production-f858.up.railway.app/start">Cuba semula</a>');
    }

    tokens[token].used = true;
    saveTokens(tokens);

    const keys = loadKeys();
    const newKey = generateKey();
    keys[newKey] = {
        used: false,
        created_at: Date.now(),
        expires_at: Date.now() + (12 * 60 * 60 * 1000)
    };
    saveKeys(keys);

    res.send('<h1>Key Kau:</h1><h2 style="color:green">' + newKey + '</h2><p>Key expire dalam 12 jam!</p>');
});

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

app.listen(3000, () => console.log('Server running'));    tokens[token].used = true;
    saveTokens(tokens);

    const keys = loadKeys();
    const newKey = generateKey();
    keys[newKey] = {
        used: false,
        created_at: Date.now(),
        expires_at: Date.now() + (12 * 60 * 60 * 1000)
    };
    saveKeys(keys);

    res.send('<h1>Key Kau:</h1><h2 style="color:green">' + newKey + '</h2><p>Key expire dalam 12 jam!</p>');
});

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

app.listen(3000, () => console.log('Server running'));
