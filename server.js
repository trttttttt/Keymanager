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

// STEP 1: User datang sini dulu
app.get('/start', function(req, res) {
    var tokens = loadTokens();
    var newToken = generateToken();
    tokens[newToken] = {
        used: false,
        expires_at: Date.now() + (10 * 60 * 1000)
    };
    saveTokens(tokens);

    // Redirect ke Linkvertise
    // Lepas complete, user kena manually pergi /getkey?token=xxx
    res.send(
        '<html><body style="font-family:sans-serif;text-align:center;padding:40px">' +
        '<h2>Step 1: Complete task di bawah untuk dapat key</h2>' +
        '<a href="https://link-hub.net/3411951/vB1f7MYaeneJ" target="_blank" style="background:green;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-size:18px">Klik Sini Untuk Complete Task</a>' +
        '<br><br>' +
        '<h2>Step 2: Lepas complete, klik butang ni</h2>' +
        '<a href="/getkey?token=' + newToken + '" style="background:blue;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-size:18px">Dapat Key Saya</a>' +
        '</body></html>'
    );
});

app.get('/getkey', function(req, res) {
    var token = req.query.token;
    var tokens = loadTokens();

    if (!token || !tokens[token]) {
        res.send('<h1 style="color:red">Akses Ditolak!</h1><a href="/start">Cuba semula</a>');
        return;
    }

    if (tokens[token].used) {
        res.send('<h1 style="color:red">Link Dah Digunakan!</h1><a href="/start">Cuba semula</a>');
        return;
    }

    if (Date.now() > tokens[token].expires_at) {
        delete tokens[token];
        saveTokens(tokens);
        res.send('<h1 style="color:red">Token Dah Expire! Ulang semula.</h1><a href="/start">Cuba semula</a>');
        return;
    }

    tokens[token].used = true;
    saveTokens(tokens);

    var keys = loadKeys();
    var newKey = generateKey();
    keys[newKey] = {
        used: false,
        created_at: Date.now(),
        expires_at: Date.now() + (12 * 60 * 60 * 1000)
    };
    saveKeys(keys);

    res.send('<h1>Key Kau:</h1><h2 style="color:green">' + newKey + '</h2><p>Key expire dalam 12 jam!</p>');
});

app.get('/verify', function(req, res) {
    var key = req.query.key;
    var keys = loadKeys();

    if (!key || !keys[key]) {
        res.json({ valid: false, reason: 'Key tidak wujud' });
        return;
    }

    if (Date.now() > keys[key].expires_at) {
        delete keys[key];
        saveKeys(keys);
        res.json({ valid: false, reason: 'Key dah expire' });
        return;
    }

    res.json({ valid: true, reason: 'Key sah!' });
});

app.listen(3000, function() {
    console.log('Server running');
});
