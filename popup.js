// ── Word / name data (inline) ─────────────────────────────────────────────────
const NICK_DATA = {
    adjectives: [
        'Silent','Swift','Dark','Bright','Iron','Silver','Golden','Crimson',
        'Arctic','Blazing','Hollow','Mystic','Neon','Phantom','Rusty','Shadow',
        'Turbo','Velvet','Wild','Frozen','Lunar','Solar','Cosmic','Stealth',
        'Thunder','Storm','Jade','Cobalt','Scarlet','Amber','Ember','Dusk',
        'Dawn','Ash','Frost','Grim','Lucky','Noble','Rapid','Rogue',
        'Savage','Toxic','Ultra','Venom','Wicked','Zephyr','Blaze','Cinder',
        'Crystal','Dread'
    ],
    nouns: [
        'Fox','Wolf','Hawk','Bear','Raven','Tiger','Viper','Eagle',
        'Shark','Ghost','Blade','Storm','Claw','Fang','Knight','Cipher',
        'Drake','Falcon','Golem','Hunter','Jackal','King','Lance','Monk',
        'Ninja','Oracle','Panda','Quill','Ranger','Scout','Titan','Umbra',
        'Viking','Wraith','Xenon','Yeti','Zealot','Archer','Baron','Cobra',
        'Dagger','Envoy','Fiend','Garnet','Hound','Imp','Jester','Kite'
    ],
    words: [
        'apple','bridge','cabin','dance','eagle','fence','grain','horse',
        'iron','jungle','kite','lemon','maple','night','ocean','piano',
        'queen','river','stone','table','uncle','valve','water','xenon',
        'yacht','zebra','anchor','barrel','castle','dagger','engine','forest',
        'garden','hammer','island','jacket','kernel','ladder','mirror','needle',
        'orange','pencil','quartz','rocket','saddle','tunnel','umbrella','valley',
        'window','yellow','zipper','basket','candle','donkey','finger','gravel',
        'harbor','insect','jigsaw','kitten','lizard','monkey','napkin','oyster',
        'pepper','rabbit','silver','timber','utopia','velvet','walnut','album',
        'bench','cloud','dream','earth','flame','grove','heart','ivory',
        'jewel','knot','light','mango','north','orbit','patch','quest',
        'ridge','smoke','trout','urban','visor','wheat','youth'
    ]
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const resultInput    = document.getElementById('result');
const copyBtn        = document.getElementById('copyBtn');
const generateBtn    = document.getElementById('generateBtn');
const toast          = document.getElementById('toast');
const strengthEl     = document.getElementById('strength');
const strengthFill   = document.getElementById('strengthFill');
const strengthLabel  = document.getElementById('strengthLabel');
const themeToggle    = document.getElementById('themeToggle');

const lengthSlider   = document.getElementById('length');
const lengthValue    = document.getElementById('lengthValue');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck   = document.getElementById('numbers');
const symbolsCheck   = document.getElementById('symbols');
const excludeSimilar = document.getElementById('excludeSimilar');

const wordCountSlider = document.getElementById('wordCount');
const wordCountValue  = document.getElementById('wordCountValue');

const pinSlider      = document.getElementById('pinLength');
const pinLengthValue = document.getElementById('pinLengthValue');

const sharedResultSection = document.querySelector('.result-section');

// ── State ─────────────────────────────────────────────────────────────────────
let activeTab = 'password';

// ── Attack speed scenarios (attempts per second) ──────────────────────────────
const ATTACK_SPEEDS = {
    fastHash:   1e10,  // Fast offline hash (MD5, SHA-1): 10 billion/sec
    slowHash:   1e4,   // Slow offline hash (bcrypt, Argon2): 10,000/sec
    online:     10     // Online attack (login throttling): 10/sec
};
const DEFAULT_SPEED = ATTACK_SPEEDS.fastHash; // Worst case

// ── Crypto helpers ────────────────────────────────────────────────────────────
function randomInt(max) {
    if (max <= 0) throw new Error('max must be positive');
    const range = 0x100000000;
    const limit = range - (range % max);
    const buf = new Uint32Array(1);
    let value;
    do { crypto.getRandomValues(buf); value = buf[0]; } while (value >= limit);
    return value % max;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pickFrom(arr) { return arr[randomInt(arr.length)]; }

// ── Password ──────────────────────────────────────────────────────────────────
const CHARSETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers:   '0123456789',
    symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?'
};
const SIMILAR = /[il1LoO0]/g;

function selectedSets() {
    const filter = s => excludeSimilar.checked ? s.replace(SIMILAR, '') : s;
    const sets = [];
    if (uppercaseCheck.checked) sets.push(filter(CHARSETS.uppercase));
    if (lowercaseCheck.checked) sets.push(filter(CHARSETS.lowercase));
    if (numbersCheck.checked)   sets.push(filter(CHARSETS.numbers));
    if (symbolsCheck.checked)   sets.push(filter(CHARSETS.symbols));
    return sets.filter(s => s.length > 0);
}

function generatePassword() {
    const sets = selectedSets();
    if (sets.length === 0) { showToast('Select at least one character type.'); return ''; }
    const charset = sets.join('');
    const length  = parseInt(lengthSlider.value, 10);
    const chars   = [];
    const guaranteed = Math.min(length, sets.length);
    for (let i = 0; i < guaranteed; i++) chars.push(pickFrom(sets[i]));
    for (let i = chars.length; i < length; i++) chars.push(pickFrom(charset));
    return shuffle(chars).join('');
}

// ── Passphrase ────────────────────────────────────────────────────────────────
function generatePassphrase() {
    const count = parseInt(wordCountSlider.value, 10);
    const sep   = document.querySelector('input[name="separator"]:checked').value;
    const words = [];
    for (let i = 0; i < count; i++) words.push(pickFrom(NICK_DATA.words));
    return words.join(sep);
}

// ── PIN ───────────────────────────────────────────────────────────────────────
function generatePIN() {
    const length = parseInt(pinSlider.value, 10);
    let pin = '';
    for (let i = 0; i < length; i++) pin += randomInt(10).toString();
    return pin;
}

// ── Username ──────────────────────────────────────────────────────────────────
function generateUsername() {
    const style = document.querySelector('input[name="usernameStyle"]:checked').value;
    const num   = () => (randomInt(90) + 10).toString();
    switch (style) {
        case 'adjnoun':    return pickFrom(NICK_DATA.adjectives) + pickFrom(NICK_DATA.nouns);
        case 'adjnounnum': return pickFrom(NICK_DATA.adjectives) + pickFrom(NICK_DATA.nouns) + num();
        case 'word':       return pickFrom(NICK_DATA.words);
        case 'wordnum':    return pickFrom(NICK_DATA.words) + num();
        default:           return pickFrom(NICK_DATA.adjectives) + pickFrom(NICK_DATA.nouns);
    }
}

// ── Crack time estimation ─────────────────────────────────────────────────────
function estimateCrackTime(bits, speed = DEFAULT_SPEED) {
    if (bits <= 0) return 'instantly';
    
    // Average case: 2^(bits-1) / speed
    // Use logarithmic calculation to avoid overflow
    const log10Time = (bits - 1) * Math.log10(2) - Math.log10(speed);
    const seconds = Math.pow(10, log10Time);
    
    if (seconds < 1) return 'instantly';
    
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;
    const thousand = year * 1000;
    const million = year * 1e6;
    const billion = year * 1e9;
    const trillion = year * 1e12;
    
    if (seconds < minute) return `${Math.round(seconds)} second${seconds !== 1 ? 's' : ''}`;
    if (seconds < hour) return `${Math.round(seconds / minute)} minute${Math.round(seconds / minute) !== 1 ? 's' : ''}`;
    if (seconds < day) return `${Math.round(seconds / hour)} hour${Math.round(seconds / hour) !== 1 ? 's' : ''}`;
    if (seconds < month) return `${Math.round(seconds / day)} day${Math.round(seconds / day) !== 1 ? 's' : ''}`;
    if (seconds < year) return `${Math.round(seconds / month)} month${Math.round(seconds / month) !== 1 ? 's' : ''}`;
    if (seconds < thousand) return `${Math.round(seconds / year)} year${Math.round(seconds / year) !== 1 ? 's' : ''}`;
    if (seconds < million) return `${Math.round(seconds / thousand)} thousand years`;
    if (seconds < billion) return `${Math.round(seconds / million)} million years`;
    if (seconds < trillion) return `${Math.round(seconds / billion)} billion years`;
    return 'trillions of years';
}

// ── Strength ──────────────────────────────────────────────────────────────────
function updateStrength(value) {
    if (!value || activeTab === 'pin' || activeTab === 'username') {
        strengthEl.hidden = true;
        return;
    }
    let bits;
    if (activeTab === 'password') {
        const pool = selectedSets().join('').length;
        bits = value.length * Math.log2(Math.max(pool, 2));
    } else {
        const wc = parseInt(wordCountSlider.value, 10);
        bits = wc * Math.log2(NICK_DATA.words.length);
    }
    let level = 'weak', label = 'Weak';
    if (bits >= 80)      { level = 'very-strong'; label = 'Very strong'; }
    else if (bits >= 60) { level = 'strong';      label = 'Strong'; }
    else if (bits >= 40) { level = 'fair';         label = 'Fair'; }
    strengthEl.hidden = false;
    strengthEl.dataset.level = level;
    strengthFill.style.width  = `${Math.min(100, (bits / 90) * 100)}%`;
    strengthLabel.textContent = `${label} · ~${Math.round(bits)} bits`;
}

// ── Run ───────────────────────────────────────────────────────────────────────
function runGenerate() {
    let value = '';
    switch (activeTab) {
        case 'password':   value = generatePassword();   break;
        case 'passphrase': value = generatePassphrase(); break;
        case 'pin':        value = generatePIN();        break;
        case 'username':   value = generateUsername();   break;
    }
    resultInput.value = value;
    updateStrength(value);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TAB_LABELS = {
    password:   'Generate password',
    passphrase: 'Generate passphrase',
    pin:        'Generate PIN',
    username:   'Generate username',
    cracktime:  'Analyze password',
    compare:    'Compare'
};

document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeTab = btn.dataset.tab;
        document.querySelectorAll('.panel').forEach(p => { p.hidden = true; });
        document.getElementById(`panel-${activeTab}`).hidden = false;
        generateBtn.textContent = TAB_LABELS[activeTab];

        const isSpecialTab = activeTab === 'compare' || activeTab === 'cracktime';
        sharedResultSection.hidden = isSpecialTab;
        generateBtn.hidden = isSpecialTab;

        if (!isSpecialTab) runGenerate();
    });
});

// ── Compare ───────────────────────────────────────────────────────────────────
function calcBitsForInput(val) {
    if (!val) return 0;
    let pool = 0;
    if (/[a-z]/.test(val)) pool += 26;
    if (/[A-Z]/.test(val)) pool += 26;
    if (/[0-9]/.test(val)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(val)) pool += 32;
    if (pool < 2) pool = 2;
    return val.length * Math.log2(pool);
}

function renderCompareBar(fillEl, labelEl, containerEl, bits) {
    let level = 'weak', label = 'Weak';
    if (bits >= 80)      { level = 'very-strong'; label = 'Very strong'; }
    else if (bits >= 60) { level = 'strong';      label = 'Strong'; }
    else if (bits >= 40) { level = 'fair';         label = 'Fair'; }
    containerEl.hidden = false;
    containerEl.dataset.level = level;
    fillEl.style.width = `${Math.min(100, (bits / 90) * 100)}%`;
    labelEl.textContent = `${label} · ~${Math.round(bits)} bits`;
}

function updateCompare() {
    const valA = document.getElementById('cmpA').value;
    const valB = document.getElementById('cmpB').value;
    const bitsA = calcBitsForInput(valA);
    const bitsB = calcBitsForInput(valB);
    const verdict = document.getElementById('compareVerdict');

    if (valA) renderCompareBar(
        document.getElementById('strengthFillA'),
        document.getElementById('strengthLabelA'),
        document.getElementById('strengthA'), bitsA);
    else document.getElementById('strengthA').hidden = true;

    if (valB) renderCompareBar(
        document.getElementById('strengthFillB'),
        document.getElementById('strengthLabelB'),
        document.getElementById('strengthB'), bitsB);
    else document.getElementById('strengthB').hidden = true;

    if (valA && valB) {
        verdict.hidden = false;
        const diff = Math.abs(bitsA - bitsB);
        if (diff < 2) {
            verdict.textContent = '≈ Both passwords are roughly equal in strength.';
            verdict.dataset.winner = 'tie';
        } else if (bitsA > bitsB) {
            verdict.textContent = `✓ Password A is stronger by ~${Math.round(diff)} bits.`;
            verdict.dataset.winner = 'a';
        } else {
            verdict.textContent = `✓ Password B is stronger by ~${Math.round(diff)} bits.`;
            verdict.dataset.winner = 'b';
        }
    } else {
        verdict.hidden = true;
    }
}

document.getElementById('cmpA').addEventListener('input', updateCompare);
document.getElementById('cmpB').addEventListener('input', updateCompare);
document.getElementById('cmpAClear').addEventListener('click', () => { document.getElementById('cmpA').value = ''; updateCompare(); });
document.getElementById('cmpBClear').addEventListener('click', () => { document.getElementById('cmpB').value = ''; updateCompare(); });

// ── Crack Time ────────────────────────────────────────────────────────────────
function updateCrackTime() {
    const val = document.getElementById('crackInput').value;
    const strengthCrack = document.getElementById('strengthCrack');
    const scenariosDiv = document.getElementById('cracktimeScenarios');
    
    if (!val) {
        strengthCrack.hidden = true;
        scenariosDiv.hidden = true;
        return;
    }
    
    const bits = calcBitsForInput(val);
    
    // Render strength bar
    let level = 'weak', label = 'Weak';
    if (bits >= 80)      { level = 'very-strong'; label = 'Very strong'; }
    else if (bits >= 60) { level = 'strong';      label = 'Strong'; }
    else if (bits >= 40) { level = 'fair';         label = 'Fair'; }
    
    strengthCrack.hidden = false;
    strengthCrack.dataset.level = level;
    document.getElementById('strengthFillCrack').style.width = `${Math.min(100, (bits / 90) * 100)}%`;
    document.getElementById('strengthLabelCrack').textContent = `${label} · ~${Math.round(bits)} bits`;
    
    // Calculate scenarios
    const fast = estimateCrackTime(bits, ATTACK_SPEEDS.fastHash);
    const slow = estimateCrackTime(bits, ATTACK_SPEEDS.slowHash);
    const online = estimateCrackTime(bits, ATTACK_SPEEDS.online);
    
    document.getElementById('scenarioFast').textContent = fast;
    document.getElementById('scenarioSlow').textContent = slow;
    document.getElementById('scenarioOnline').textContent = online;
    
    scenariosDiv.hidden = false;
}

document.getElementById('crackInput').addEventListener('input', updateCrackTime);

// ── Sliders ───────────────────────────────────────────────────────────────────
function syncSlider(slider, display) {
    display.textContent = slider.value;
    slider.setAttribute('aria-valuenow', slider.value);
}

lengthSlider.addEventListener('input', () => { syncSlider(lengthSlider, lengthValue); runGenerate(); });
wordCountSlider.addEventListener('input', () => { syncSlider(wordCountSlider, wordCountValue); runGenerate(); });
pinSlider.addEventListener('input', () => { syncSlider(pinSlider, pinLengthValue); runGenerate(); });

[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck, excludeSimilar].forEach(el => {
    el.addEventListener('change', runGenerate);
});
document.querySelectorAll('input[name="separator"]').forEach(el => el.addEventListener('change', runGenerate));
document.querySelectorAll('input[name="usernameStyle"]').forEach(el => el.addEventListener('change', runGenerate));

generateBtn.addEventListener('click', runGenerate);

// ── Copy ──────────────────────────────────────────────────────────────────────
async function copyResult() {
    const text = resultInput.value;
    if (!text) { showToast('Nothing to copy.'); return; }
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard.');
    } catch {
        resultInput.focus();
        resultInput.select();
        const ok = document.execCommand('copy');
        showToast(ok ? 'Copied to clipboard.' : 'Could not copy.');
    }
}
copyBtn.addEventListener('click', copyResult);

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2000);
}

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
themeToggle.addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ── Init ──────────────────────────────────────────────────────────────────────
syncSlider(lengthSlider, lengthValue);
syncSlider(wordCountSlider, wordCountValue);
syncSlider(pinSlider, pinLengthValue);
applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
runGenerate();
