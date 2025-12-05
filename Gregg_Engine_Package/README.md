# Gregg Shorthand Engine

A complete JavaScript engine for rendering Gregg Shorthand with context-aware strokes and animated drawing.

![Gregg Shorthand](https://img.shields.io/badge/Edition-Pre--Anniversary%201916-blue)
![Dictionary](https://img.shields.io/badge/Dictionary-15%2C832%20words-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Engine Size

| Component | Size |
|-----------|------|
| **javascript_engine/** | **642 KB** |
| └─ dictionary_full.js | 358 KB |
| └─ paths.js | 219 KB |
| └─ gregg.js | 34 KB |
| └─ char.js | 15 KB |
| └─ renderer.js | 13 KB |
| └─ point.js | 3 KB |

**Total JavaScript Engine: ~642 KB** (minified would be ~400 KB)

## Features

- **Full Dictionary**: 15,832 Pre-Anniversary Edition words (1916)
- **Context-Aware Rendering**: Strokes adapt based on adjacent strokes (head/tail variants)
- **Human-Like Output**: Uses professional model system (ER, EL, SW, SWL, etc.)
- **Animated Drawing**: Shows correct stroke direction with full path coverage
- **Pure JavaScript**: No backend required - runs entirely in the browser
- **Grascii Support**: Full Grascii notation parsing with modifiers (^, ~, |, _, etc.)

## Quick Start

1. Copy the `javascript_engine/` folder to your project
2. Include the scripts in your HTML:

```html
<!-- Include in order -->
<script src="javascript_engine/dictionary_full.js"></script>
<script src="javascript_engine/point.js"></script>
<script src="javascript_engine/paths.js"></script>
<script src="javascript_engine/char.js"></script>
<script src="javascript_engine/gregg.js"></script>
<script src="javascript_engine/renderer.js"></script>
```

3. Use the API:

```javascript
// Render an English word
const result = renderEnglishWord("meeting");
document.body.appendChild(result.svg);

// Render direct Grascii notation
const result2 = renderDirectGrascii("M-E-T-NG");
const svg = createSVGFromChars(result2.chars);
document.body.appendChild(svg);
```

## Project Structure

```
GREGG_ENGINE_PRODUCTION/
├── index.html                      # Demo page
├── README.md                       # This file
├── ARCHITECTURE.md                 # System architecture
├── API_REFERENCE.md                # API documentation
├── INTEGRATION_GUIDE.md            # Integration guide
├── javascript_engine/              # ← SEND THIS FOLDER
│   ├── dictionary_full.js          # 15,832 word dictionary (358 KB)
│   ├── paths.js                    # SVG path definitions (219 KB)
│   ├── gregg.js                    # Stroke definitions (34 KB)
│   ├── char.js                     # Character classes (15 KB)
│   ├── renderer.js                 # High-level API (13 KB)
│   ├── point.js                    # 2D vector utilities (3 KB)
│   └── README.md                   # Engine documentation
└── TESTING/                        # Testing tools (optional)
    ├── visual_comparison.html      # Accuracy analysis
    ├── draw_recognize.html         # Draw & recognize
    └── images/                     # Reference images (62 MB)
```

## What to Share

**Minimum required** (for teammates):
- `javascript_engine/` folder (642 KB)

**Optional extras**:
- `index.html` - Demo page
- `TESTING/` - Testing tools with reference images

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and data flow
- **[API_REFERENCE.md](API_REFERENCE.md)** - Function reference and usage examples
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - How to integrate into your project
- **[javascript_engine/README.md](javascript_engine/README.md)** - Detailed engine API

## How It Works

1. **Dictionary Lookup**: English word → Grascii notation (e.g., "meeting" → "M-E-T-NG")
2. **Tokenization**: Parse notation into stroke tokens (handles CH, NG, TH, etc.)
3. **Character Creation**: Create Head/Tail variants for smooth connections
4. **Context Resolution**: Each stroke checks neighbors to select path variant
5. **SVG Generation**: Generate and render SVG paths

## Grascii Notation

Grascii is a phonetic ASCII representation of Gregg Shorthand:

| Notation | Sound | Example |
|----------|-------|---------|
| K | hard K | bacon → BAKN |
| CH | ch sound | church → CHCH |
| SH | sh sound | ship → SHEP |
| TH | th sound | the → TH |
| NG | ng sound | bring → BRNG |
| ^ | disjoiner | pen lift |
| ~ | over | loop-back modifier |
| _ | wunderbar | W sound hook |

## Accuracy

Tested against 15,832 reference images:
- **Average similarity**: ~78%
- **High match (≥80%)**: 59% of words
- **Common words**: Higher accuracy (brief forms)

## Sources & Credits

- **Grascii Editor**: [github.com/grascii/grascii-editor](https://github.com/grascii/grascii-editor) (MIT License)
- **Gregg Pre-Anniversary Edition** (1916) - Public domain
- **Šarman 2008**: "Geometry of Gregg Shorthand" (mathematical foundation)

## License

MIT License - See individual files for attribution.
