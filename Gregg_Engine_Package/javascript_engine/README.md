# Gregg Shorthand Engine - JavaScript Library

A pure JavaScript engine for rendering **Gregg Pre-Anniversary Shorthand** notation to SVG.

## 📦 Total Size: 642 KB

| File | Size | Description |
|------|------|-------------|
| dictionary_full.js | 358 KB | 15,832 Pre-Anniversary word definitions |
| paths.js | 219 KB | SVG path definitions for all strokes |
| gregg.js | 34 KB | Stroke classes with context-aware logic |
| char.js | 15 KB | Base character classes and modifiers |
| renderer.js | 13 KB | High-level API (tokenizer, render functions) |
| point.js | 3 KB | 2D vector/point utilities |

## 📁 File Loading Order

Scripts must be loaded in this order:

```html
<script src="javascript_engine/dictionary_full.js"></script>
<script src="javascript_engine/point.js"></script>
<script src="javascript_engine/paths.js"></script>
<script src="javascript_engine/char.js"></script>
<script src="javascript_engine/gregg.js"></script>
<script src="javascript_engine/renderer.js"></script>
```

## 🚀 Quick Start

### Render English Word

```javascript
const result = renderEnglishWord("meeting");
document.body.appendChild(result.svg);
// Returns: { svg, notation, strokeCount, english }
```

### Render Grascii Notation

```javascript
const result = renderDirectGrascii("M-E-T-NG");
const svg = createSVGFromChars(result.chars);
document.body.appendChild(svg);
// Returns: { notation, strokeCount, chars, english }
```

### Render Sentence

```javascript
const result = renderEnglishText("I have the book");
const svg = createSVGFromChars(result.chars);
document.body.appendChild(svg);
```

### Animated Rendering

```javascript
const result = renderDirectGrascii("TH");
const svg = createSVGFromChars(result.chars, true); // true = animated
document.body.appendChild(svg);
```

## 📖 API Reference

### Main Functions (renderer.js)

| Function | Description |
|----------|-------------|
| `renderEnglishWord(word)` | Render single English word to SVG |
| `renderEnglishText(text)` | Render text/sentence to chars |
| `renderDirectGrascii(notation)` | Render Grascii notation to chars |
| `createSVGFromChars(chars, animate)` | Create SVG from char array |
| `grasciiToEnglish(notation)` | Lookup English from Grascii |
| `tokenizeGrascii(notation)` | Split notation into tokens |
| `grasciiToChars(notation)` | Convert notation to Char objects |

### Data Structures

```javascript
// Render result object
{
  notation: "M-E-T-NG",   // Grascii notation
  strokeCount: 4,         // Number of strokes
  chars: [...],           // Array of Char objects
  english: "meeting",     // English word (if found)
  svg: SVGElement         // (only from renderEnglishWord)
}

// Dictionary lookup
GREGG_DICTIONARY["the"]     // → "TH"
GREGG_DICTIONARY["meeting"] // → "M-E-T-NG"
```

## 📝 Grascii Notation

### Consonant Strokes

| Token | Stroke Type | Sound |
|-------|-------------|-------|
| K | Short forward curve | K |
| G | Long forward curve | G |
| R | Short backward curve | R |
| L | Long backward curve | L |
| N | Short horizontal | N |
| M | Long horizontal | M |
| T | Short diagonal up | T |
| D | Long diagonal up | D |
| P | Short left comma | P |
| B | Long left comma | B |
| F | Short right comma | F |
| V | Long right comma | V |
| S | Small S curve | S |
| TH | Under-loop | TH |
| CH | Diagonal down | CH |
| SH | Longer diagonal | SH |
| NG | Southeast stroke | NG |
| NK | Long southeast | NK |

### Vowel Strokes

| Token | Position | Sound |
|-------|----------|-------|
| A | Circle | A (cat) |
| E | Small hook | E (bet) |
| I | Dot/mark | I (bit) |
| O | Hook | O (hot) |
| U | Small hook | U (but) |
| ' | Clockwise circle | Aspiration |

### Modifier Characters

| Symbol | Name | Effect |
|--------|------|--------|
| `-` | Separator | Separates strokes |
| `^` | Disjoiner | Pen lift (CharDisjoin) |
| `~` | Over | Loop-back blend (CharOver) |
| `\|` | Tick | Small tick mark (CharTick) |
| `_` | Wunderbar | W sound hook (CharWunderbar) |
| `(` | Left hook | Small left curve |
| `)` | Right hook | Small right curve |

### Multi-Character Tokens

The tokenizer automatically handles:
- 2-char: CH, SH, TH, NG, NK, LD, TN, DN, TM, DM, NT, MT, ND, MD, SS, XS, MN, MM, DD, TD, DT, SL, AE, EU, AU, OE
- 3-char: JNT, JND, PND, PNT, A&'
- 4-char: A&E

## ⚙️ Configuration

In `renderer.js`:

```javascript
const SVG_SCALE = 3;         // Output scale multiplier
const WORD_SPACING = 15;     // Pixels between words
const STROKE_DURATION = 0.4; // Animation duration (seconds)
```

## 🔧 Advanced Usage

### Custom SVG Creation

```javascript
// Get character objects
const result = renderDirectGrascii("M-E-T-NG");

// Custom positioning
const pos = {x: 10, y: 50, left: 10, right: 10, bottom: 50, row: 50};
const elements = Char.createElements(result.chars, pos);

// Build custom SVG
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("viewBox", `0 0 ${pos.right + 20} ${pos.bottom + 20}`);
svg.setAttribute("stroke", "black");
svg.setAttribute("stroke-width", "2");
svg.setAttribute("fill", "none");
svg.appendChild(elements);
```

### Fallback for Unknown Words

```javascript
// If word not in dictionary, use letter-by-letter
const grascii = wordToLetterByLetter("xyz");
const result = renderDirectGrascii(grascii);
```

## 🏗️ Architecture

### Head/Tail System

Each stroke can have Head and Tail variants:
- **Head**: Entry connector (from previous stroke)
- **Tail**: Main body + exit (to next stroke)

```javascript
// Stroke rendering logic:
// - Single stroke word: Head + Tail (complete stroke)
// - First stroke: Tail only (no incoming connection)
// - Middle/Last: Head + Tail (incoming + outgoing)
```

### Context-Aware Paths

Strokes adapt based on neighbors:

```javascript
// In gregg.js, each stroke checks context:
GreggKTail.prototype.setPaths = function() {
  if (this.getNextName() == "GreggI") {
    this.setPathsFromObject(PATHS.K.default_tail);
    return;
  }
  // ... more context checks
};
```

## 📊 Dictionary Stats

- **Total Words**: 15,832
- **Edition**: Pre-Anniversary (1916)
- **Format**: `GREGG_DICTIONARY["word"] = "GRASCII"`

## 🧪 Testing

See `TESTING/visual_comparison.html` for accuracy analysis against reference images.

## 📜 License

MIT License - Based on Grascii Editor (MIT).
Gregg Shorthand system is public domain.
