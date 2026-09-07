(() => {
  const frame = document.getElementById('game');
  if (!frame) return;

  function findSprite() {
    try {
      for (const s of document.scripts) {
        const t = s.textContent || '';
        const m = t.match(/const\s+SPRITE\s*=\s*'(data:image\/gif;base64,[^']+)'/);
        if (m) return m[1];
      }
    } catch (e) {}
    return '';
  }

  const sprite = findSprite();
  if (!sprite) return;

  function install() {
    let d;
    try { d = frame.contentDocument; } catch (e) { return; }
    if (!d || !d.body) { setTimeout(install, 120); return; }

    const old = d.getElementById('mounted-test-character');
    if (old) old.remove();

    let mount = d.getElementById('mounted-test-character-v2');
    if (!mount) {
      mount = d.createElement('img');
      mount.id = 'mounted-test-character-v2';
      mount.alt = 'Bruno montado no lobisomem';
      mount.src = sprite;
      Object.assign(mount.style, {
        position: 'fixed',
        zIndex: '9999',
        pointerEvents: 'none',
        width: 'auto',
        objectFit: 'contain',
        transformOrigin: 'center bottom',
        imageRendering: 'auto',
        filter: 'drop-shadow(0 4px 3px rgba(0,0,0,.28))',
        display: 'none'
      });
      d.body.appendChild(mount);
    }

    let running = true;
    function tick() {
      if (!running || !d.documentElement) return;
      try {
        const orig = d.getElementById('brunoHD');
        if (!orig) {
          mount.style.display = 'none';
          requestAnimationFrame(tick);
          return;
        }

        const cs = d.defaultView.getComputedStyle(orig);
        const r = orig.getBoundingClientRect();
        if (cs.display === 'none' || r.width < 2 || r.height < 2) {
          mount.style.display = 'none';
          requestAnimationFrame(tick);
          return;
        }

        // A cópia esconde somente o personagem original. Física e jogo continuam iguais.
        orig.style.opacity = '0';

        const flip = (orig.style.transform || '').includes('scaleX(-1)') ? -1 : 1;
        const h = Math.min(Math.max(r.height * 1.68, 86), frame.clientHeight * 0.48);
        mount.style.left = (r.left + r.width / 2) + 'px';
        mount.style.top = r.bottom + 'px';
        mount.style.height = h + 'px';
        mount.style.transform = `translate(-50%,-100%) scaleX(${flip})`;
        mount.style.display = 'block';
      } catch (e) {
        mount.style.display = 'none';
      }
      requestAnimationFrame(tick);
    }
    tick();

    frame.addEventListener('load', () => { running = false; setTimeout(install, 80); }, { once: true });
  }

  frame.addEventListener('load', () => setTimeout(install, 80));
  setTimeout(install, 500);
})();
