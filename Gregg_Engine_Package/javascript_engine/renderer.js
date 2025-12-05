/**
 * ============================================================================
 * GREGG SHORTHAND RENDERER - renderer.js
 * ============================================================================
 * 
 * High-level rendering functions for converting English/Grascii to SVG.
 * Uses the core engine (gregg.js, char.js, paths.js) for actual rendering.
 * 
 * SIZE: ~13 KB
 * 
 * MAIN FUNCTIONS:
 * - renderEnglishWord(word)      → Render single word to SVG
 * - renderEnglishText(text)      → Render sentence to chars
 * - renderDirectGrascii(notation)→ Render Grascii notation to chars
 * - createSVGFromChars(chars)    → Create SVG element from chars
 * - grasciiToEnglish(notation)   → Lookup English from Grascii
 * - tokenizeGrascii(notation)    → Parse notation into tokens
 * - grasciiToChars(notation)     → Convert to Char objects
 * 
 * DEPENDENCIES (load in this order):
 * 1. dictionary_full.js (GREGG_DICTIONARY)
 * 2. point.js (Point class)
 * 3. paths.js (SVG path definitions)
 * 4. char.js (Char, CharSpace, CharDisjoin, CharOver, CharTick, CharWunderbar)
 * 5. gregg.js (GreggChar classes)
 * 6. renderer.js (this file)
 * 
 * LICENSE: MIT
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
const SVG_SCALE = 3;          // Scale factor for larger SVG output
const WORD_SPACING = 15;      // Space between words in a sentence
const STROKE_DURATION = 0.4;  // Animation duration per stroke (seconds)

// ============================================================================
// REVERSE DICTIONARY (Grascii → English)
// ============================================================================
let REVERSE_DICTIONARY = null;

/**
 * Build reverse dictionary for Grascii → English lookups
 * @returns {Object} Map of Grascii notation to array of English words
 */
function buildReverseDictionary() {
    if (REVERSE_DICTIONARY) return REVERSE_DICTIONARY;
    
    REVERSE_DICTIONARY = {};
    for (const [english, grascii] of Object.entries(GREGG_DICTIONARY)) {
        if (!REVERSE_DICTIONARY[grascii]) {
            REVERSE_DICTIONARY[grascii] = [];
        }
        REVERSE_DICTIONARY[grascii].push(english);
    }
    return REVERSE_DICTIONARY;
}

/**
 * Look up English word(s) from Grascii notation
 * @param {string} grascii - Grascii notation
 * @returns {string[]} Array of possible English words
 */
function grasciiToEnglish(grascii) {
    const reverseDict = buildReverseDictionary();
    return reverseDict[grascii] || [];
}

// ============================================================================
// TOKENIZATION
// ============================================================================

/**
 * Tokenize Grascii notation into individual stroke tokens
 * Handles multi-character tokens like CH, NG, A&', JNT, etc.
 * @param {string} notation - Grascii notation string
 * @returns {string[]} Array of tokens
 */
function tokenizeGrascii(notation) {
    const tokens = [];
    let i = 0;

    // Multi-character tokens (sorted by length - longest first for greedy matching)
    const multiCharTokens = [
        // 4-character
        'A&E',
        // 3-character
        'JNT', 'JND', 'PND', 'PNT', "A&'",
        // 2-character
        'CH', 'LD', 'NG', 'NK', 'TN', 'DN', 'TM', 'DM',
        'NT', 'MT', 'ND', 'MD', 'DF', 'DV', 'TV',
        'SS', 'XS', 'MN', 'MM', 'DT', 'TD', 'DD',
        'SH', 'TH', 'AE', 'EU', 'AU', 'OE', 'SL'
    ];

    while (i < notation.length) {
        let matched = false;

        // Try to match multi-character tokens first
        for (const token of multiCharTokens) {
            if (notation.substr(i, token.length) === token) {
                tokens.push(token);
                i += token.length;
                matched = true;
                break;
            }
        }

        // If no multi-char match, take single character
        if (!matched) {
            const char = notation[i];
            // Skip special characters that aren't strokes
            // Also skip unknown chars like ~, `, etc.
            const skipChars = ['-', '\\\\', '`', ' ', ',', '.', '!', '?'];
            if (!skipChars.includes(char)) {
                // Map Z and X to S (no dedicated strokes in Gregg)
                if (char === 'Z' || char === 'z') {
                    tokens.push('S');
                } else if (char === 'X' || char === 'x') {
                    tokens.push('S');
                } else if (char === '~' || char === '^' || char === '|' || char === '_') {
                    // Keep special modifiers as-is (Char.dict handles these)
                    tokens.push(char);
                } else {
                    tokens.push(char);
                }
            }
            i++;
        }
    }

    return tokens;
}

// ============================================================================
// GRASCII TO CHARACTERS CONVERSION
// ============================================================================

/**
 * Convert Grascii notation to character objects
 * 
 * HEAD/TAIL SYSTEM (matching the editor behavior):
 * - First stroke: Head only (no incoming connection needed)
 * - Middle strokes: Head + Tail (incoming + outgoing connections)
 * - Last stroke: Head + Tail (the stroke itself + its ending)
 * 
 * The Head is the main stroke body, Tail is the connector/ending.
 * 
 * @param {string} grasciiNotation - Grascii notation string
 * @returns {Char[]} Array of character objects
 */
function grasciiToChars(grasciiNotation) {
    const chars = [];

    // Tokenize first to handle multi-character tokens
    const tokens = tokenizeGrascii(grasciiNotation);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Special handling for modifier characters (handled by Char.dict, not GreggChar.dict)
        // ^: disjoiner (pen lift), ~: over (loop-back), |: tick, _: wunderbar (W sound)
        if (token === '^' || token === '~' || token === '|' || token === '_') {
            const specialCtor = Char.dict[token];
            if (specialCtor) {
                chars.push(new specialCtor());
            }
            continue;
        }
        
        const charCtors = GreggChar.dict[token];

        if (!charCtors) {
            console.warn(`No constructor found for token: ${token}`);
            continue;
        }

        // If it's an array, it has Head and Tail variants
        // Head = entry connector (from previous stroke)
        // Tail = main stroke body (leads to next stroke)
        if (Array.isArray(charCtors)) {
            if (tokens.length === 1) {
                // Single stroke word: add both Head and Tail for complete stroke
                chars.push(new charCtors[0]()); // Head (entry)
                chars.push(new charCtors[1]()); // Tail (main body)
            } else if (i === 0) {
                // First stroke: Tail only (no entry connector needed)
                chars.push(new charCtors[1]()); // Tail = main stroke body
            } else {
                // Middle and Last strokes: Head (connector) + Tail (body)
                chars.push(new charCtors[0]()); // Head (connector from prev)
                chars.push(new charCtors[1]()); // Tail (main body)
            }
        } else {
            // Single constructor (no head/tail variants)
            chars.push(new charCtors());
        }
    }

    return chars;
}

// ============================================================================
// LETTER MAPPING (for fallback rendering)
// ============================================================================

/**
 * Convert a word to letter-by-letter Grascii (fallback for unknown words)
 * Note: Some letters don't have direct strokes (z uses S, x uses SS)
 * @param {string} word - English word
 * @returns {string} Grascii notation
 */
function wordToLetterByLetter(word) {
    const letterMap = {
        'a': 'A', 'b': 'B', 'c': 'K', 'd': 'D', 'e': 'E',
        'f': 'F', 'g': 'G', 'h': "'", 'i': 'I', 'j': 'J',
        'k': 'K', 'l': 'L', 'm': 'M', 'n': 'N', 'o': 'O',
        'p': 'P', 'q': 'K', 'r': 'R', 's': 'S', 't': 'T',
        'u': 'U', 'v': 'V', 'w': 'U', 'x': 'S', 'y': 'E',
        'z': 'S'  // Z uses S stroke (no dedicated Z stroke in Gregg)
    };
    
    return word.split('').map(c => letterMap[c] || '').join('');
}

// ============================================================================
// INPUT MODE DETECTION
// ============================================================================

/**
 * Check if a string looks like Grascii notation
 * Grascii is typically ALL CAPS with special chars like & '
 * @param {string} str - Input string
 * @returns {boolean} True if looks like Grascii
 */
function looksLikeGrascii(str) {
    const upperStr = str.replace(/[&'^\-\\]/g, '');
    return upperStr === upperStr.toUpperCase() && /^[A-Z&'^\-\\]+$/.test(str);
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Render direct Grascii notation
 * @param {string} notation - Grascii notation
 * @returns {Object} Render result with notation, strokeCount, chars, english
 */
function renderDirectGrascii(notation) {
    const tokens = tokenizeGrascii(notation);
    const chars = grasciiToChars(notation);
    const englishWords = grasciiToEnglish(notation);
    
    return {
        notation: notation,
        strokeCount: tokens.length,
        chars: chars,
        english: englishWords.length > 0 ? englishWords.join(', ') : '(not in dictionary)'
    };
}

/**
 * Render English text (word or sentence)
 * @param {string} text - English text
 * @returns {Object} Render result with notation, strokeCount, chars, english
 */
function renderEnglishText(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const allChars = [];
    const notations = [];
    const englishWords = [];
    let totalStrokes = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        let grascii = GREGG_DICTIONARY[word];
        let usedFallback = false;

        // If word not in dictionary, use letter-by-letter fallback
        if (!grascii) {
            grascii = wordToLetterByLetter(word);
            usedFallback = true;
        }

        const tokens = tokenizeGrascii(grascii);
        const chars = grasciiToChars(grascii);
        
        notations.push(usedFallback ? `[${grascii}]` : grascii);
        englishWords.push(usedFallback ? `[${word}]` : word);
        totalStrokes += tokens.length;
        
        // Add characters
        allChars.push(...chars);

        // Add space between words (except after last word)
        if (i < words.length - 1) {
            allChars.push(new CharSpace());
        }
    }

    return {
        notation: notations.join(' '),
        strokeCount: totalStrokes,
        chars: allChars,
        english: englishWords.join(' ')
    };
}

/**
 * Create SVG element from character array
 * @param {Char[]} chars - Array of character objects
 * @param {boolean} animated - Whether to apply animation classes
 * @returns {SVGElement} SVG element
 */
function createSVGFromChars(chars, animated = false) {
    // Use Char.createElements to properly connect and render
    const pos = {x: 20, y: 80, left: 20, right: 20, bottom: 80, row: 80};
    const svgElements = Char.createElements(chars, pos);

    // Calculate dimensions with scale
    const baseWidth = Math.max(pos.right + 40, 150);
    const baseHeight = Math.max(pos.bottom + 40, 100);
    const scaledWidth = baseWidth * SVG_SCALE;
    const scaledHeight = baseHeight * SVG_SCALE;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", scaledWidth);
    svg.setAttribute("height", scaledHeight);
    svg.setAttribute("viewBox", `0 0 ${baseWidth} ${baseHeight}`);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';

    if (animated) {
        svg.classList.add('animated');
    }

    svg.appendChild(svgElements);
    return svg;
}

/**
 * Animate strokes with full path coverage from start to end
 * @param {SVGElement} svg - SVG element to animate
 */
function animateStrokes(svg) {
    const paths = svg.querySelectorAll('path');
    let totalDelay = 0;

    paths.forEach((path, index) => {
        const pathLength = path.getTotalLength();
        
        if (pathLength > 0) {
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = pathLength;
            path.style.setProperty('--path-length', pathLength);
            path.style.animation = `draw ${STROKE_DURATION}s ease-in-out forwards`;
            path.style.animationDelay = `${totalDelay}s`;
            totalDelay += STROKE_DURATION;
        }
    });
}

// ============================================================================
// EXPORTS (for module usage)
// ============================================================================
// These are available globally when loaded as a script tag
if (typeof window !== 'undefined') {
    window.GreggRenderer = {
        // Configuration
        SVG_SCALE,
        WORD_SPACING,
        STROKE_DURATION,
        
        // Reverse dictionary
        buildReverseDictionary,
        grasciiToEnglish,
        
        // Tokenization & conversion
        tokenizeGrascii,
        grasciiToChars,
        wordToLetterByLetter,
        looksLikeGrascii,
        
        // Rendering
        renderDirectGrascii,
        renderEnglishText,
        createSVGFromChars,
        animateStrokes
    };
}
