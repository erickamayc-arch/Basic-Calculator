'use strict';

// ── State ──────────────────────────────────────────────────
const state = {
  current:     '0',
  previous:    '',
  operator:    null,
  shouldReset: false,
};

// ── DOM References ─────────────────────────────────────────
const screen       = document.getElementById('screen');
const equationLine = document.getElementById('equationLine');
// FIXED: Typo was "dcument"
const messageText  = document.getElementById('messageText'); 
const hugotOverlay = document.getElementById('hugotOverlay');
const hugotClose   = document.getElementById('hugotClose');
const allBtns      = document.querySelectorAll('.btn');

// ── Rotating banner quotes ─────────────────────────────────
const bannerQuotes = [
  'ikaw lang ang sagot ko sa lahat ng tanong...',
  'bakit pa mag-calculator kung ikaw pa rin ang kulang?',
  'mas mahirap kalkulahin ang pagmamahal mo...',
  'kahit anong gawin ko, ikaw pa rin ang resulta.',
  'hindi ko na kailangang mag-isip kung nandito ka.',
  'sana ako pa rin ang nasa memory mo.',
];
let quoteIndex = 0;

function rotateBanner() {
  quoteIndex = (quoteIndex + 1) % bannerQuotes.length;
  messageText.style.opacity = '0';
  setTimeout(() => {
    messageText.textContent = bannerQuotes[quoteIndex];
    messageText.style.opacity = '1';
  }, 400);
}

setInterval(rotateBanner, 5000);

// ── Update Display ─────────────────────────────────────────
function updateScreen() {
  const display = formatDisplay(state.current);
  screen.textContent = display;

  if (state.previous && state.operator) {
    // FIXED: Used backticks for Template Literals
    equationLine.textContent = `${formatDisplay(state.previous)} ${state.operator}`;
  } else {
    equationLine.innerHTML = '&nbsp;';
  }

  // Bump animation
  screen.classList.remove('bump');
  void screen.offsetWidth; 
  screen.classList.add('bump');
}

function formatDisplay(val) {
  if (val === 'Error' || val === '') return val;
  if (val.endsWith('.')) return val; 

  const n = parseFloat(val);
  if (isNaN(n)) return val;

  const parts = val.split('.');
  const intPart = parseInt(parts[0], 10).toLocaleString('en-PH');

  if (parts.length > 1) {
    return intPart + '.' + parts[1];
  }
  return intPart;
}

// ── Logic Functions ────────────────────────────────────────
function inputNumber(digit) {
  if (state.current === '0' || state.shouldReset) {
    state.current     = digit;
    state.shouldReset = false;
  } else {
    if (state.current.replace('-', '').length >= 12) return;
    state.current += digit;
  }
  updateScreen();
}

function inputDecimal() {
  if (state.shouldReset) {
    state.current     = '0.';
    state.shouldReset = false;
    updateScreen();
    return;
  }
  if (!state.current.includes('.')) {
    state.current += '.';
    updateScreen();
  }
}

function inputOperator(op, activeBtn) {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('selected'));

  if (state.operator && !state.shouldReset) {
    performCalculation();
  }

  state.previous    = state.current;
  state.operator    = op;
  state.shouldReset = true;

  if (activeBtn) activeBtn.classList.add('selected');
  updateScreen();
}

function inputEquals() {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('selected'));
  if (!state.operator || !state.previous) return;

  const success = performCalculation();
  if (success) {
    showHugot();
  }
}

function performCalculation() {
  const prev = parseFloat(state.previous);
  const curr = parseFloat(state.current);

  if (isNaN(prev) || isNaN(curr)) return false;

  let result;
  switch (state.operator) {
    case '+': result = prev + curr; break;
    case '−': result = prev - curr; break;
    case '×': result = prev * curr; break;
    case '÷':
      if (curr === 0) {
        state.current = 'Error';
        state.operator = null;
        state.previous = '';
        state.shouldReset = true;
        updateScreen();
        return false;
      }
      result = prev / curr;
      break;
    default: return false;
  }

  const cleaned = parseFloat(result.toPrecision(12));
  state.current     = String(cleaned);
  state.previous    = '';
  state.operator    = null;
  state.shouldReset = true;

  updateScreen();
  return true;
}

function inputClear() {
  state.current     = '0';
  state.previous    = '';
  state.operator    = null;
  state.shouldReset = false;
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('selected'));
  updateScreen();
}

function inputSign() {
  if (state.current === '0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
  updateScreen();
}

function inputPercent() {
  const n = parseFloat(state.current);
  if (isNaN(n)) return;
  state.current = String(n / 100);
  updateScreen();
}

// ── Hugot Popup ────────────────────────────────────────────
function showHugot() {
  hugotOverlay.classList.add('show');
}

function hideHugot() {
  hugotOverlay.classList.remove('show');
}

hugotClose.addEventListener('click', hideHugot);
hugotOverlay.addEventListener('click', (e) => {
  if (e.target === hugotOverlay) hideHugot();
});

// ── Event Listeners ────────────────────────────────────────
allBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const { action, value } = btn.dataset;
    switch (action) {
      case 'number':   inputNumber(value); break;
      case 'decimal':  inputDecimal(); break;
      case 'operator': inputOperator(value, btn); break;
      case 'equals':   inputEquals(); break;
      case 'clear':    inputClear(); break;
      case 'sign':     inputSign(); break;
      case 'percent':  inputPercent(); break;
    }
  });
});

// Initial call
updateScreen();