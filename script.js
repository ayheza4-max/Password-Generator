const form = document.getElementById('form');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copy');
const lengthInput = document.getElementById('length');
const lengthVal = document.getElementById('lengthVal');
const errorEl = document.getElementById('error');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

const lower = document.getElementById('lower');
const upper = document.getElementById('upper');
const numbers = document.getElementById('numbers');
const symbols = document.getElementById('symbols');

const CHARS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

lengthInput.addEventListener('input', () => {
  lengthVal.textContent = lengthInput.value;
});

function randomIndex(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function buildPassword() {
  const length = Number(lengthInput.value);
  const active = [];
  if (lower.checked) active.push('lower');
  if (upper.checked) active.push('upper');
  if (numbers.checked) active.push('numbers');
  if (symbols.checked) active.push('symbols');

  if (active.length === 0) {
    errorEl.textContent = 'Pick at least one character type.';
    return null;
  }
  errorEl.textContent = '';

  const pool = active.map((k) => CHARS[k]).join('');
  const chars = [];

  // Guarantee at least one character from each selected set
  active.forEach((k) => {
    const set = CHARS[k];
    chars.push(set[randomIndex(set.length)]);
  });

  // Fill the rest from the combined pool
  while (chars.length < length) {
    chars.push(pool[randomIndex(pool.length)]);
  }

  // Shuffle so the guaranteed characters aren't all at the front
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

function evaluateStrength(pwd) {
  if (!pwd) return { level: '—', pct: 0, color: '#ef4444' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { level: 'Weak',   pct: 33,  color: '#ef4444' };
  if (score <= 4) return { level: 'Medium', pct: 66,  color: '#f59e0b' };
  return              { level: 'Strong', pct: 100, color: '#16a34a' };
}

function render(pwd) {
  output.textContent = pwd;
  output.classList.toggle('empty', !pwd);
  const s = evaluateStrength(pwd);
  strengthFill.style.width = s.pct + '%';
  strengthFill.style.background = s.color;
  strengthLabel.textContent = s.level;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pwd = buildPassword();
  if (pwd) render(pwd);
});

copyBtn.addEventListener('click', async () => {
  if (output.classList.contains('empty') || !output.textContent) return;
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('copied');
    }, 1500);
  } catch {
    errorEl.textContent = 'Copy failed — select and copy manually.';
  }
});

// First password on load
render(buildPassword());