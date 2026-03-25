/* ============================================================
   HUGOT CALCULATOR — cal.js
   ============================================================ */

const screen = document.getElementById('screen');
const equationLine = document.getElementById('equationLine');
const messageText = document.getElementById('messageText');
const hugotOverlay = document.getElementById('hugotOverlay');
const hugotClose = document.getElementById('hugotClose');

let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetScreen = false;

// --- Hugot Database ---
const hugotLines = [
    "Buti pa yung math, may logic. Tayo, wala.",
    "Ang hirap mag-solve ng problem na hindi naman sa'yo.",
    "Sana yung sakit, naki-clear din ng AC button.",
    "Bakit pagdating sa'yo, laging laging 'Error'?",
    "Zero. Parang yung chance na maging tayo ulit.",
    "Nahanap mo na ba yung 'X' mo?"
];

// --- Event Listeners ---
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action === 'number') appendNumber(value);
        if (action === 'operator') setOperator(value);
        if (action === 'equals') calculate();
        if (action === 'clear') clearAll();
        if (action === 'decimal') appendDecimal();
        
        // Randomly change the banner message on click
        if (Math.random() > 0.8) {
            messageText.innerText = hugotLines[Math.floor(Math.random() * hugotLines.length)];
        }
    });
});

// --- Functions ---
function appendNumber(num) {
    if (screen.innerText === '0' || shouldResetScreen) {
        screen.innerText = num;
        shouldResetScreen = false;
    } else {
        screen.innerText += num;
    }
}

function setOperator(op) {
    operator = op;
    previousInput = screen.innerText;
    equationLine.innerText = `${previousInput} ${op}`;
    shouldResetScreen = true;
}

function calculate() {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(screen.innerText);

    if (isNaN(prev) || isNaN(current)) return;

    // The "Broken Math" Logic
    if (operator === '÷' && current === 0) {
        showHugot("WALANG FOREVER", "Hindi ma-divide ang atensyon mo sa amin.");
        clearAll();
        return;
    }

    switch (operator) {
        case '+': result = prev + current; break;
        case '−': result = prev - current; break;
        case '×': result = prev * current; break;
        case '÷': result = prev / current; break;
        default: return;
    }

    equationLine.innerText = `${prev} ${operator} ${current} =`;
    screen.innerText = result;
    
    // Trigger Overlay on special results
    if (result === 143) {
        showHugot("I LOVE YOU", "Sana totoo na lang 'to, hindi lang math.");
    }
    
    shouldResetScreen = true;
}

function clearAll() {
    screen.innerText = '0';
    equationLine.innerHTML = '&nbsp;';
    previousInput = '';
    operator = null;
    // Add a small shake to the calculator
    document.querySelector('.calculator').classList.add('shake-it');
    setTimeout(() => document.querySelector('.calculator').classList.remove('shake-it'), 500);
}

// --- Popup Logic ---
function showHugot(main, accent) {
    const card = document.getElementById('hugotCard');
    card.querySelector('.hugot-main').innerText = main;
    card.querySelector('.hugot-accent').innerText = accent;
    hugotOverlay.classList.add('show');
}

hugotClose.addEventListener('click', () => {
    hugotOverlay.classList.remove('show');
});