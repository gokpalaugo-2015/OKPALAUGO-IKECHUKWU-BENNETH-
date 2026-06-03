// Calculator State
let display = document.getElementById('display');
let historyList = document.getElementById('history-list');
let currentValue = '0';
let previousValue = '';
let operation = null;
let shouldResetDisplay = false;
let history = [];
let memory = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    loadTheme();
    addThemeToggle();
    addClearHistoryButton();
    console.log('Scientific Calculator Initialized');
});

// ==================== DISPLAY FUNCTIONS ====================

/**
 * Append number to display
 */
function appendNumber(num) {
    if (shouldResetDisplay) {
        currentValue = num;
        shouldResetDisplay = false;
    } else {
        if (currentValue === '0' && num !== '.') {
            currentValue = num;
        } else if (num === '.' && currentValue.includes('.')) {
            return;
        } else {
            currentValue += num;
        }
    }
    updateDisplay();
}

/**
 * Handle arithmetic operators
 */
function appendOperator(op) {
    if (currentValue === '') return;

    if (previousValue !== '' && operation) {
        calculate();
    }

    operation = op;
    previousValue = currentValue;
    currentValue = '';
    updateDisplay();
}

/**
 * Handle scientific functions
 */
function appendFunction(func) {
    try {
        let result;
        const num = parseFloat(currentValue);

        switch (func) {
            case 'sin':
                // Convert degrees to radians
                result = Math.sin(num * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(num * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(num * Math.PI / 180);
                break;
            case 'sqrt':
                if (num < 0) {
                    showError('Negative square root');
                    return;
                }
                result = Math.sqrt(num);
                break;
            case 'log':
                // Base 10 logarithm
                if (num <= 0) {
                    showError('Log of invalid number');
                    return;
                }
                result = Math.log10(num);
                break;
            case 'ln':
                // Natural logarithm
                if (num <= 0) {
                    showError('Ln of invalid number');
                    return;
                }
                result = Math.log(num);
                break;
            case 'pow':
                // Square
                result = num * num;
                break;
            case 'cbrt':
                // Cube root
                result = Math.cbrt(num);
                break;
            case 'fact':
                // Factorial
                if (num < 0 || num !== Math.floor(num)) {
                    showError('Invalid factorial');
                    return;
                }
                result = factorial(parseInt(num));
                if (result === Infinity) {
                    showError('Factorial too large');
                    return;
                }
                break;
            case 'percent':
                // Convert to percentage
                result = num / 100;
                break;
            default:
                return;
        }

        currentValue = formatNumber(result);
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        showError('Calculation error');
    }
}

/**
 * Append mathematical constants
 */
function appendConstant(constant) {
    try {
        if (constant === 'pi') {
            currentValue = formatNumber(Math.PI);
        } else if (constant === 'e') {
            currentValue = formatNumber(Math.E);
        }
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        showError('Error');
    }
}

/**
 * Clear all values
 */
function clearDisplay() {
    currentValue = '0';
    previousValue = '';
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();
}

/**
 * Delete last digit
 */
function deleteLast() {
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
    updateDisplay();
}

/**
 * Toggle sign of current number
 */
function toggleSign() {
    try {
        const num = parseFloat(currentValue);
        currentValue = formatNumber(-num);
        updateDisplay();
    } catch (error) {
        showError('Error');
    }
}

/**
 * Update display with current value
 */
function updateDisplay() {
    display.value = currentValue || '0';
}

/**
 * Format number to reasonable decimal places
 */
function formatNumber(num) {
    if (!isFinite(num)) {
        return 'Error';
    }
    // Limit to 10 decimal places to avoid floating point errors
    const rounded = Math.round(num * 10000000000) / 10000000000;
    return rounded.toString();
}

/**
 * Show error message temporarily
 */
function showError(message) {
    const originalValue = display.value;
    display.value = message;
    setTimeout(() => {
        display.value = originalValue;
    }, 1500);
}

// ==================== CALCULATION FUNCTIONS ====================

/**
 * Perform calculation
 */
function calculate() {
    if (!operation || previousValue === '' || currentValue === '') {
        return;
    }

    try {
        let result;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);

        if (isNaN(prev) || isNaN(current)) {
            showError('Invalid calculation');
            return;
        }

        switch (operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        const operatorSymbol = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        }[operation] || operation;

        const expression = `${previousValue} ${operatorSymbol} ${currentValue}`;
        addToHistory(expression, result);

        currentValue = formatNumber(result);
        operation = null;
        previousValue = '';
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        showError('Calculation error');
    }
}

/**
 * Calculate factorial
 */
function factorial(n) {
    if (n > 170) return Infinity; // Factorial limit for JavaScript numbers
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// ==================== MEMORY FUNCTIONS ====================

/**
 * Clear memory
 */
function memoryClear() {
    memory = 0;
    console.log('Memory cleared');
}

/**
 * Recall value from memory
 */
function memoryRecall() {
    currentValue = formatNumber(memory);
    shouldResetDisplay = true;
    updateDisplay();
}

/**
 * Add current value to memory
 */
function memoryPlus() {
    try {
        const num = parseFloat(currentValue);
        if (!isNaN(num)) {
            memory += num;
            console.log('Memory +:', memory);
            currentValue = '0';
            shouldResetDisplay = true;
            updateDisplay();
        }
    } catch (error) {
        showError('Error');
    }
}

/**
 * Subtract current value from memory
 */
function memoryMinus() {
    try {
        const num = parseFloat(currentValue);
        if (!isNaN(num)) {
            memory -= num;
            console.log('Memory -:', memory);
            currentValue = '0';
            shouldResetDisplay = true;
            updateDisplay();
        }
    } catch (error) {
        showError('Error');
    }
}

// ==================== HISTORY FUNCTIONS ====================

/**
 * Add calculation to history
 */
function addToHistory(expression, result) {
    const item = {
        expression: expression,
        result: formatNumber(result),
        timestamp: new Date().toLocaleTimeString()
    };

    history.unshift(item);
    
    // Keep only last 50 items
    if (history.length > 50) {
        history.pop();
    }

    saveHistory();
    renderHistory();
}

/**
 * Render history list
 */
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No history yet</p>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="useHistoryItem(${index})" title="Click to use this result">
            <strong>${escapeHtml(item.expression)}</strong> = <span style="color: #34c759; font-weight: bold;">${escapeHtml(item.result)}</span>
            <br><small style="opacity: 0.6;">${item.timestamp}</small>
        </div>
    `).join('');
}

/**
 * Use value from history
 */
function useHistoryItem(index) {
    if (index >= 0 && index < history.length) {
        currentValue = history[index].result;
        shouldResetDisplay = true;
        updateDisplay();
    }
}

/**
 * Clear entire history
 */
function clearHistoryList() {
    if (history.length === 0) return;

    if (confirm('Are you sure you want to clear the entire history?')) {
        history = [];
        saveHistory();
        renderHistory();
    }
}

/**
 * Add clear history button to UI
 */
function addClearHistoryButton() {
    const historyHeader = document.querySelector('.history h3');
    if (historyHeader && !historyHeader.querySelector('.clear-history-btn')) {
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.className = 'clear-history-btn';
        clearBtn.style.cssText = `
            padding: 5px 10px;
            background: #ff3b30;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
        `;
        clearBtn.onmouseover = () => clearBtn.style.background = '#ff1744';
        clearBtn.onmouseout = () => clearBtn.style.background = '#ff3b30';
        clearBtn.onclick = (e) => {
            e.stopPropagation();
            clearHistoryList();
        };
        historyHeader.appendChild(clearBtn);
    }
}

/**
 * Save history to localStorage
 */
function saveHistory() {
    try {
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

/**
 * Load history from localStorage
 */
function loadHistory() {
    try {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            history = JSON.parse(saved);
            renderHistory();
        }
    } catch (error) {
        console.error('Error loading history:', error);
        history = [];
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== THEME FUNCTIONS ====================

/**
 * Add theme toggle button to UI
 */
function addThemeToggle() {
    const container = document.querySelector('.container');
    if (!container) return;

    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-btn';
    themeBtn.id = 'themeBtn';
    themeBtn.title = 'Toggle Dark/Light Mode (T)';
    themeBtn.addEventListener('click', toggleTheme);

    themeToggle.appendChild(themeBtn);
    container.insertBefore(themeToggle, container.firstChild);
    updateThemeButton();
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateThemeButton();
}

/**
 * Update theme button emoji
 */
function updateThemeButton() {
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    }
}

/**
 * Load saved theme or system preference
 */
function loadTheme() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'dark' || (!theme && prefersDark)) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ==================== KEYBOARD SUPPORT ====================

/**
 * Handle keyboard input
 */
document.addEventListener('keydown', (e) => {
    const key = e.key;
    const isInput = e.target === display;

    // Number keys
    if (key >= '0' && key <= '9') {
        appendNumber(key);
        e.preventDefault();
    }

    // Decimal point
    if (key === '.') {
        appendNumber('.');
        e.preventDefault();
    }

    // Operators
    if (key === '+') {
        appendOperator('+');
        e.preventDefault();
    }
    if (key === '-' && !isInput) {
        appendOperator('-');
        e.preventDefault();
    }
    if (key === '*') {
        appendOperator('*');
        e.preventDefault();
    }
    if (key === '/') {
        e.preventDefault();
        appendOperator('/');
    }

    // Special keys
    if (key === 'Enter' || key === '=') {
        calculate();
        e.preventDefault();
    }
    if (key === 'Escape') {
        clearDisplay();
        e.preventDefault();
    }
    if (key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
        clearDisplay();
        e.preventDefault();
    }
    if (key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        toggleTheme();
        e.preventDefault();
    }
    if (key === 'Backspace') {
        deleteLast();
        e.preventDefault();
    }

    // Memory operations with Alt key
    if (e.altKey) {
        if (key.toLowerCase() === 'c') {
            memoryClear();
            e.preventDefault();
        }
        if (key.toLowerCase() === 'r') {
            memoryRecall();
            e.preventDefault();
        }
        if (key.toLowerCase() === 'p') {
            memoryPlus();
            e.preventDefault();
        }
        if (key.toLowerCase() === 'm') {
            memoryMinus();
            e.preventDefault();
        }
    }
});

/**
 * Visual feedback for keyboard presses
 */
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (document.activeElement !== display) {
        return;
    }
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Add hover effects to buttons
 */
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(2px)';
        });
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});

// ==================== ERROR HANDLING ====================

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

console.log('=== Scientific Calculator Script Loaded ===');
console.log('Keyboard Shortcuts:');
console.log('- Numbers (0-9): Type numbers');
console.log('- Operators: + - * / for arithmetic');
console.log('- Enter or =: Calculate result');
console.log('- Backspace: Delete last digit');
console.log('- C: Clear display');
console.log('- T: Toggle theme');
console.log('- Alt+C: Memory Clear');
console.log('- Alt+R: Memory Recall');
console.log('- Alt+P: Memory Plus');
console.log('- Alt+M: Memory Minus');
console.log('====================================');
