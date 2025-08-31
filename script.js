  // palette variable keys (same as before)
  
  
    kofiWidgetOverlay.draw('nederliver', {
    'type': 'floating-chat',
    'floating-chat.donateButton.text': 'Donate',
    'floating-chat.donateButton.background-color': '#1C191C',
    'floating-chat.donateButton.text-color': '#FBFEFD',
    });

  
  const paletteVars = [
    '--charcoal',
    '--base',
    '--surface',
    '--overlay-0',    
    '--overlay-1',  
    '--overlay-2',  
    '--overlay-3',
    '--highlight-low',
    '--highlight-med',
    '--highlight-high',
    '--mute',
    '--subtle',
    '--text',
    '--salmon',
    '--gold',
    '--leaf'
  ];

  function hexClean(hex) {
    return hex.trim().replace(/^["']|["']$/g, "") || '#000000';
  }

  function hexToRgb(hex) {
    hex = hexClean(hex);
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const int = parseInt(hex, 16);
    return {
      r: (int >> 16) & 255,
      g: (int >> 8) & 255,
      b: int & 255
    };
  }

  function rgbString(rgb) {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  function hexToHsl(hex) {
    const {r, g, b} = hexToRgb(hex);
    const r1 = r / 255, g1 = g / 255, b1 = b / 255;
    const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
        case g1: h = (b1 - r1) / d + 2; break;
        case b1: h = (r1 - g1) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied!');
    } catch (err) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Copied!');
      } catch (e) {
        alert('Copy failed — value:\\n' + text);
      }
      ta.remove();
    }
  }

  const toastEl = document.getElementById('copied-toast');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.opacity = 1;
    toastEl.setAttribute('aria-hidden', 'false');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.style.opacity = 0;
      toastEl.setAttribute('aria-hidden', 'true');
    }, 1200);
  }

let lastFlashedBtn = null;

function flashButton(btn, origLabel, timeout = 1200) {
  // if another button is still showing "Copied", reset it
  if (lastFlashedBtn && lastFlashedBtn !== btn) {
    clearTimeout(lastFlashedBtn._flashTimer);
    lastFlashedBtn.innerText = lastFlashedBtn.dataset.orig || 'HEX';
    lastFlashedBtn.disabled = false;
  }

  clearTimeout(btn._flashTimer);
  btn.dataset.orig = origLabel;
  btn.disabled = true;
  btn.innerText = 'Copied';
  lastFlashedBtn = btn;

  btn._flashTimer = setTimeout(() => {
    btn.innerText = btn.dataset.orig || origLabel;
    btn.disabled = false;
    if (lastFlashedBtn === btn) lastFlashedBtn = null; // clear if it's the last one
  }, timeout);
}


  function buildPalette() {
    const root = getComputedStyle(document.documentElement);
    const container = document.getElementById('palette');
    container.innerHTML = '';

    paletteVars.forEach(varName => {
      const raw = root.getPropertyValue(varName) || '';
      const hex = hexClean(raw);
      const rgb = hexToRgb(hex);
      const hsl = hexToHsl(hex);

      const item = document.createElement('div');
      item.className = 'swatch';

      // left column: name above preview
      const left = document.createElement('div');
      left.className = 'swatch-left';

      const name = document.createElement('div');
      name.className = 'swatch-name';
      name.textContent = varName.replace('--', '');

      // swatch preview
      const preview = document.createElement('div');
      preview.className = 'swatch-preview';
      preview.style.backgroundColor = hex;
      preview.setAttribute('aria-hidden', 'true');

      left.append(name, preview);

      // info (values + buttons)
      const info = document.createElement('div');
      info.className = 'swatch-info';

      const valueLine = document.createElement('div');
      valueLine.className = 'swatch-values';

      // spacer preserves the horizontal place where hex used to be
      const spacer = document.createElement('div');
      spacer.className = 'swatch-spacer';
      valueLine.appendChild(spacer);

      // buttons: HEX, RGB, HSL
      const btns = document.createElement('div');
      btns.className = 'swatch-btns';

      const btnHex = document.createElement('button');
      btnHex.className = 'copy-btn';
      btnHex.title = `Copy ${hex.toUpperCase()}`;
      btnHex.innerText = 'HEX';
      btnHex.addEventListener('click', () => {
        copyToClipboard(hex.toUpperCase());
        flashButton(btnHex, 'HEX');
      });

      const rgbStr = rgbString(rgb);
      const btnRgb = document.createElement('button');
      btnRgb.className = 'copy-btn';
      btnRgb.title = `Copy ${rgbStr}`;
      btnRgb.innerText = 'RGB';
      btnRgb.addEventListener('click', () => {
        copyToClipboard(rgbStr);
        flashButton(btnRgb, 'RGB');
      });

      const hslStr = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;
      const btnHsl = document.createElement('button');
      btnHsl.className = 'copy-btn';
      btnHsl.title = `Copy ${hslStr}`;
      btnHsl.innerText = 'HSL';
      btnHsl.addEventListener('click', () => {
        copyToClipboard(hslStr);
        flashButton(btnHsl, 'HSL');
      });

      btns.append(btnHex, btnRgb, btnHsl);

      valueLine.append(btns);
      info.append(valueLine);
      item.append(left, info);
      container.appendChild(item);
    });
  }

  window.addEventListener('load', buildPalette);

  // watch for CSS variable changes (optional)
  let lastSnapshot = '';
  setInterval(() => {
    const root = getComputedStyle(document.documentElement);
    const snapshot = paletteVars.map(k => root.getPropertyValue(k)).join('|');
    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      buildPalette();
    }
  }, 800);