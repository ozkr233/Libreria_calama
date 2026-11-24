/* Utilidades de interfaz: formato, íconos, portadas, avisos, modales, voz sintetizada y preferencias visuales. */
(function () {
  const LC = window.LC;

  LC.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  LC.clp = n => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
  LC.fecha = (iso, hora = false) => new Date(iso).toLocaleString('es-CL', hora
    ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'long', year: 'numeric' });
  LC.uid = () => Math.random().toString(36).slice(2, 10);
  LC.$ = (s, r = document) => r.querySelector(s);
  LC.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  LC.normalizar = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const ICONOS = {
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    campana: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    carrito: '<path d="M3 4h2l2.4 11h11L21 7H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
    texto: '<path d="M3 19 8 5l5 14M4.8 14.5h6.4"/><circle cx="17.5" cy="15.5" r="3"/><path d="M20.5 12v7"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    mano: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.5 0-4-1.2-5.5-3.5l-1.7-2.9a1.5 1.5 0 0 1 2.5-1.7L8 15"/>',
    volumen: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    corazon: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    estrella: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    libro: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19"/>',
    enviar: '<path d="M4 12 20 4l-6 16-3-7z"/>',
    huella: '<path d="M6.5 6.5A8 8 0 0 1 20 12v1M4 12a8 8 0 0 1 .9-3.7M12 8a4 4 0 0 1 4 4v1.5c0 2.5-.6 4.8-1.6 6.5M8 12a4 4 0 0 1 1.2-2.8M8 12v1.5c0 1.6-.4 3.2-1.2 4.5M12 12v2c0 2.8-.8 5.2-2.2 7M19.5 16.5c-.3 1.3-.8 2.5-1.4 3.5"/>',
    camion: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    marcador: '<path d="M7 3h10v18l-5-4-5 4z"/>',
    chispa: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    play: '<path d="M7 5v14l12-7z"/>',
    pausa: '<path d="M8 5v14M16 5v14"/>',
    flecha: '<path d="M15 6l-6 6 6 6"/>',
  };
  LC.icono = (nombre, clase = '') => `<svg class="ico ${clase}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONOS[nombre] || ''}</svg>`;

  /* Portadas generadas con el estilo de la casa: color mineral, autor arriba, título y horizonte. */
  LC.portada = (l, clase = '') => `<div class="portada ${clase}" style="--c:${l.color};--t:${l.tinta}" aria-hidden="true">
      <span class="portada__interior">
        <span class="portada__autor">${LC.esc(l.autor)}</span>
        <span class="portada__titulo">${LC.esc(l.titulo)}</span>
      </span>
      <span class="portada__horizonte"></span>
    </div>`;

  LC.precioHTML = (l, formato = 'impreso') => {
    const base = LC.precioBase(l, formato), final = LC.precio(l, formato);
    if (final === 0) return '<strong class="precio">Gratis</strong>';
    if (l.oferta) return `<del class="precio-antes">${LC.clp(base)}</del> <strong class="precio precio--oferta">${LC.clp(final)}</strong> <span class="insignia insignia--oferta">−${l.oferta} %</span>`;
    return `<strong class="precio">${LC.clp(final)}</strong>`;
  };

  LC.calificacion = id => {
    const r = (LC.leer('resenas', {})[id] || []);
    if (!r.length) return { promedio: 0, total: 0 };
    return { promedio: r.reduce((s, x) => s + x.nota, 0) / r.length, total: r.length };
  };
  LC.estrellas = (n, etiqueta = true) => {
    const llenas = Math.round(n);
    const svg = Array.from({ length: 5 }, (_, i) => LC.icono('estrella', i < llenas ? 'llena' : '')).join('');
    return `<span class="estrellas" ${etiqueta ? `role="img" aria-label="${n.toFixed(1)} de 5 estrellas"` : 'aria-hidden="true"'}>${svg}</span>`;
  };

  LC.tarjeta = l => {
    const agotado = l.stock <= 0 && !l.formatos.includes('digital');
    const formato = l.stock <= 0 ? 'digital' : 'impreso';
    return `<article class="libro">
      <a href="#/libro/${l.id}" class="libro__enlace">${LC.portada(l)}<h3 class="libro__titulo">${LC.esc(l.titulo)}</h3></a>
      <p class="libro__autor">${LC.esc(l.autor)}</p>
      <p class="libro__precio">${LC.precioHTML(l, formato)}</p>
      <button class="btn btn--chico" data-action="agregar" data-id="${l.id}" data-formato="${formato}" ${agotado ? 'disabled' : ''}>${agotado ? 'Agotado' : 'Agregar al carrito'}</button>
    </article>`;
  };

  /* ---------- Avisos breves ---------- */
  LC.toast = (msg, tipo = 'ok') => {
    const zona = LC.$('#toasts');
    const t = document.createElement('div');
    t.className = 'toast toast--' + tipo;
    t.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    t.textContent = msg;
    zona.appendChild(t);
    setTimeout(() => { t.classList.add('toast--sale'); setTimeout(() => t.remove(), 300); }, 3800);
  };

  /* ---------- Modal accesible (dialog nativo) ---------- */
  LC.modal = (titulo, html, alMontar) => {
    const d = LC.$('#modal');
    d.innerHTML = `<div class="modal__cab"><h2 id="modal-titulo">${titulo}</h2><button class="btn-icono" data-action="cerrar-modal" aria-label="Cerrar">${LC.icono('cerrar')}</button></div><div class="modal__cuerpo">${html}</div>`;
    d.setAttribute('aria-labelledby', 'modal-titulo');
    if (!d.open) d.showModal();
    if (alMontar) alMontar(d);
    return d;
  };
  LC.cerrarModal = () => { const d = LC.$('#modal'); if (d.open) d.close(); };
  LC.confirmar = (titulo, texto, textoBoton) => new Promise(resolve => {
    LC.modal(titulo, `<p>${texto}</p><div class="fila-botones"><button class="btn" data-r="0">Cancelar</button><button class="btn btn--primario" data-r="1">${textoBoton}</button></div>`, d => {
      LC.$$('[data-r]', d).forEach(b => b.addEventListener('click', () => { LC.cerrarModal(); resolve(b.dataset.r === '1'); }));
      d.addEventListener('close', () => resolve(false), { once: true });
    });
  });

  /* ---------- Lectura en voz alta (Web Speech API) ---------- */
  LC.puedeHablar = 'speechSynthesis' in window;
  LC.hablar = (texto, idioma = 'es', alTerminar) => {
    if (!LC.puedeHablar) { LC.toast('Tu navegador no permite leer en voz alta.', 'error'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    const voces = speechSynthesis.getVoices();
    const voz = idioma === 'en'
      ? voces.find(v => v.lang.startsWith('en-GB')) || voces.find(v => v.lang.startsWith('en'))
      : voces.find(v => v.lang === 'es-CL') || voces.find(v => v.lang === 'es-US') || voces.find(v => v.lang.startsWith('es'));
    if (voz) u.voice = voz;
    u.lang = voz ? voz.lang : (idioma === 'en' ? 'en-GB' : 'es-CL');
    u.rate = LC.leer('prefs', {}).velocidadVoz || 1;
    if (alTerminar) u.onend = alTerminar;
    speechSynthesis.speak(u);
    return u;
  };
  LC.callar = () => { if (LC.puedeHablar) speechSynthesis.cancel(); };

  /* ---------- Preferencias visuales: tema, color, letra ---------- */
  LC.PREFS_BASE = { tema: 'claro', acento: '#0E5B50', escala: 100, interlineado: 'normal', dislexia: false, subrayado: false, movimiento: false, velocidadVoz: 1 };
  LC.prefs = () => ({ ...LC.PREFS_BASE, ...LC.leer('prefs', {}) });

  const hexARgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const rgbAHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  const luminancia = rgb => { const [r, g, b] = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  LC.contraste = (a, b) => { const l1 = luminancia(hexARgb(a)), l2 = luminancia(hexARgb(b)); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const mezclar = (hex, con, t) => { const a = hexARgb(hex), b = hexARgb(con); return rgbAHex(a.map((v, i) => v + (b[i] - v) * t)); };
  /* Ajusta el color elegido hasta que tenga contraste 4,5:1 con el fondo del tema */
  LC.ajustarContraste = (hex, fondo, haciaClaro) => {
    let c = hex;
    for (let t = 0; t <= 1 && LC.contraste(c, fondo) < 4.6; t += 0.05) c = mezclar(hex, haciaClaro ? '#FFFFFF' : '#000000', t);
    return c;
  };

  LC.aplicarPrefs = () => {
    const p = LC.prefs();
    const raiz = document.documentElement;
    raiz.dataset.tema = p.tema;
    raiz.style.setProperty('--escala', p.escala / 100);
    raiz.classList.toggle('pref-dislexia', !!p.dislexia);
    raiz.classList.toggle('pref-subrayado', !!p.subrayado);
    raiz.classList.toggle('pref-sin-movimiento', !!p.movimiento);
    raiz.classList.toggle('pref-interlineado', p.interlineado === 'amplio');
    if (p.tema === 'contraste') { ['--primario', '--sobre-primario'].forEach(v => raiz.style.removeProperty(v)); return; }
    const oscuro = p.tema === 'oscuro';
    const fondo = oscuro ? '#13201F' : '#F4F6F3';
    const primario = LC.ajustarContraste(p.acento, fondo, oscuro);
    raiz.style.setProperty('--primario', primario);
    raiz.style.setProperty('--primario-suave', mezclar(primario, fondo, oscuro ? 0.78 : 0.86));
    raiz.style.setProperty('--sobre-primario', LC.contraste(primario, '#FFFFFF') >= 4.5 ? '#FFFFFF' : '#0A1413');
  };
})();
