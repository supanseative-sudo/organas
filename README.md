# Organas — Fresh Fruits

A single-page fruit brand site: arc-wheel hero (header V2) or classic carousel (V1), scroll-driven product pages with prices and a cart, a draggable gallery with video, and a live control panel (DialKit) for every text, image, color, font and animation value.

## Run it

```bash
python3 serve.py
```

This serves the folder on `127.0.0.1`, picks a free port and opens your browser. The site must be served over HTTP (opening `index.html` directly blocks the fonts).

## Edit it

Open the DialKit icon (bottom-right). Use **Copy all settings** to save your values, **Reset everything** to go back to the defaults. Add `?clean` to the address to hide the panel.

- `js/defaults.js` — default content, prices, header settings
- `js/main.js` — hero wheel / carousel and scroll animation
- `js/shop.js` — prices, weights, cart drawer
- `js/panel.js` — the DialKit controls
- `css/style.css` — all styling

Prices in `defaults.js` are placeholders (per kg). Checkout is not connected: set a checkout link in the Shop panel.
