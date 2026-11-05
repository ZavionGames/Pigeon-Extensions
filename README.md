# Pigeon — Chrome Extension

Browser-based security tools as a Chrome extension. Generate strong passwords, passphrases, PINs, and usernames directly from your toolbar. No account, no server, no tracking.

**Web app:** [pigeonofficial.vercel.app](https://pigeonofficial.vercel.app)  
**Source (web):** [ZavionGames/Pigeon](https://github.com/ZavionGames/Pigeon)  
**Privacy policy:** [pigeonofficial.vercel.app/privacy.html](https://pigeonofficial.vercel.app/privacy.html)

---

## Features

- **Password generator** — 8–64 characters, uppercase, lowercase, numbers, symbols, exclude similar characters
- **Passphrase generator** — 3–8 words with customizable separator
- **PIN generator** — 4–12 digits
- **Username generator** — adjective+noun, word+number styles
- **Password compare** — compare two passwords with strength estimation
- **Strength meter** — entropy-based (bits) strength indicator
- **Dark / light theme** — respects system preference, toggleable
- Cryptographically random via `crypto.getRandomValues`
- Zero permissions required — no `tabs`, no `storage`, no host access

## Installation

### From source (developer mode)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this folder.
4. The Pigeon icon will appear in your toolbar.

### From Chrome Web Store

Coming soon.

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 config |
| `popup.html` | Extension popup UI |
| `popup.css` | Popup styles |
| `popup.js` | Generation logic and UI |
| `theme-init.js` | Theme initialization (before paint) |
| `icons/` | Extension icons (16, 32, 48, 128px) |

## Privacy

Pigeon requests no special browser permissions and collects no data whatsoever. All generation happens in-memory and nothing is ever transmitted or stored. See the full [privacy policy](https://pigeonofficial.vercel.app/privacy.html).

## License

MIT
