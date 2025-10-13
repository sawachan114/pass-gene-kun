const passwordDisplay = document.getElementById('password-display');
const regenerateBtn = document.getElementById('regenerate-btn');
const copyBtn = document.getElementById('copy-btn');

const lengthDisplay = document.getElementById('length-display');
const lengthMinus = document.getElementById('length-minus');
const lengthPlus = document.getElementById('length-plus');
const lengthSlider = document.getElementById('length-slider');

const symbolOptions = document.getElementById('symbol-options');
const symbolCheckboxesContainer = document.getElementById('symbol-checkboxes');

const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*_+=-|,.',
};
const MIN_LENGTH = 8;
const MAX_LENGTH = 32;
let currentLength = 16;
let isShowingFeedback = false;

function init() {
    createSymbolCheckboxes();
    setupEventListeners();
    handleOptionChange();
    generatePassword();
}

function createSymbolCheckboxes() {
    symbolCheckboxesContainer.textContent = '';
    CHAR_SETS.symbols.split('').forEach(char => {
        const wrapper = document.createElement('div');
        wrapper.className = 'symbol-checkbox-wrapper';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `symbol-${char}`;
        checkbox.value = char;
        checkbox.checked = true;
        
        const customCheckbox = document.createElement('span');
        customCheckbox.className = 'custom-checkbox';

        const label = document.createElement('label');
        label.htmlFor = `symbol-${char}`;
        label.textContent = char;
        
        label.prepend(customCheckbox);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        symbolCheckboxesContainer.appendChild(wrapper);
    });
}

function setupEventListeners() {
    regenerateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);

    lengthMinus.addEventListener('click', () => updateLength(currentLength - 1));
    lengthPlus.addEventListener('click', () => updateLength(currentLength + 1));
    lengthSlider.addEventListener('input', (e) => updateLength(parseInt(e.target.value, 10)));

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', handleOptionChange);
    });
    
    symbolCheckboxesContainer.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            generatePassword();
        }
    });
}

function generatePassword() {
    if (isShowingFeedback) return;

    passwordDisplay.classList.remove('error', 'success');
    copyBtn.disabled = false;

    const settings = getSettingsFromUI();
    
    if (!settings.uppercase[0] && !settings.lowercase[0] && !settings.numbers[0] && !settings.symbols[0]) {
        document.getElementById('uc-2').checked = true;
        document.getElementById('lc-2').checked = true;
        document.getElementById('num-2').checked = true;
        Object.assign(settings, getSettingsFromUI());
    }

    if (settings.symbols[1] && settings.selectedSymbols.length === 0) {
        passwordDisplay.value = '使用する記号を1つ以上選択してください';
        passwordDisplay.classList.add('error');
        copyBtn.disabled = true;
        return;
    }

    let password = [];
    let charPool = '';
    
    if (settings.uppercase[1]) password.push(getRandomChar(CHAR_SETS.uppercase));
    if (settings.lowercase[1]) password.push(getRandomChar(CHAR_SETS.lowercase));
    if (settings.numbers[1]) password.push(getRandomChar(CHAR_SETS.numbers));
    if (settings.symbols[1]) password.push(getRandomChar(settings.selectedSymbols));

    if (settings.uppercase[0]) charPool += CHAR_SETS.uppercase;
    if (settings.lowercase[0]) charPool += CHAR_SETS.lowercase;
    if (settings.numbers[0]) charPool += CHAR_SETS.numbers;
    if (settings.symbols[0]) charPool += settings.selectedSymbols;
    
    const remainingLength = currentLength - password.length;
    if (charPool.length === 0 && remainingLength > 0) {
         passwordDisplay.value = '文字セットを1つ以上選択してください';
         passwordDisplay.classList.add('error');
         copyBtn.disabled = true;
         return;
    }
    for (let i = 0; i < remainingLength; i++) {
        password.push(getRandomChar(charPool));
    }

    passwordDisplay.value = shuffleArray(password).join('');
}

function getSettingsFromUI() {
    const settings = {}; 
    const types = ['uppercase', 'lowercase', 'numbers', 'symbols'];
    types.forEach(function(type) {
        settings[type] = document.querySelector(`input[name="${type}"]:checked`).id;
    });

    const selectedSymbols = Array.from(document.querySelectorAll('#symbol-checkboxes input:checked'))
                                 .map(cb => cb.value)
                                 .join('');

    return {
        uppercase: [!settings.uppercase.endsWith('0'), settings.uppercase.endsWith('2')],
        lowercase: [!settings.lowercase.endsWith('0'), settings.lowercase.endsWith('2')],
        numbers: [!settings.numbers.endsWith('0'), settings.numbers.endsWith('2')],
        symbols: [!settings.symbols.endsWith('0'), settings.symbols.endsWith('2')],
        selectedSymbols: selectedSymbols
    };
}

function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function updateLength(newLength) {
    if (newLength >= MIN_LENGTH && newLength <= MAX_LENGTH) {
        currentLength = newLength;
        lengthDisplay.textContent = currentLength;
        lengthSlider.value = currentLength;
        generatePassword();
    }
}

function handleOptionChange() {
    const symbolsValue = document.querySelector('input[name="symbols"]:checked').value;
    if (symbolsValue > 0) {
        symbolOptions.classList.remove('hidden');
    } else {
        symbolOptions.classList.add('hidden');
    }
    generatePassword();
}

async function copyToClipboard() {
    if (passwordDisplay.classList.contains('error') || isShowingFeedback) {
        return;
    }
    const originalPassword = passwordDisplay.value;

    try {
        await navigator.clipboard.writeText(originalPassword);
        showFeedback('コピーしました！', 'success', originalPassword);
    } catch (err) {
        showFeedback('コピーに失敗しました', 'error', originalPassword);
    }
}

function showFeedback(message, type, originalPassword) {
    isShowingFeedback = true;
    passwordDisplay.value = message;
    passwordDisplay.classList.add(type);

    setTimeout(() => {
        passwordDisplay.value = originalPassword;
        passwordDisplay.classList.remove(type);
        isShowingFeedback = false;
    }, 1500);
}

init();
