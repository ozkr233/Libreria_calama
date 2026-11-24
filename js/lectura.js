/* Lectura: biblioteca digital (17), lector interactivo (18), IA de lectura (20),
   club con videollamadas (19) y aprendizaje de idiomas (21). */
(function () {
  const LC = window.LC;
  const { esc, icono, $, $$ } = LC;
  const V = LC.vistas, A = LC.acciones;
  const encabezado = (...a) => LC.encabezado(...a);

  /* ============ 17. Biblioteca digital ============ */
  V.biblioteca = () => {
    const mios = LC.biblioteca().map(LC.libro).filter(Boolean);
    const gratis = LC.catalogo().filter(l => l.texto && l.formatos.includes('digital') && LC.precio(l, 'digital') === 0 && !LC.enBiblioteca(l.id));
    const conLicencia = LC.catalogo().filter(l => l.formatos.includes('digital') && LC.precio(l, 'digital') > 0 && !LC.enBiblioteca(l.id));
    const prog = LC.leer('progreso', {});
    LC.pintar('Mi biblioteca', `${encabezado('Mi biblioteca digital', 'Tus libros digitales y obras gratuitas de dominio público.')}
      <section aria-labelledby="t-mios">
        <h2 id="t-mios">Tus libros</h2>
        ${mios.length ? `<ul class="estanteria">${mios.map(l => {
          const p = prog[l.id] || 0;
          return `<li class="libro-digital">
            <a href="#/leer/${l.id}" tabindex="-1" aria-hidden="true">${LC.portada(l, 'portada--mini')}</a>
            <div>
              <h3><a href="#/leer/${l.id}">${esc(l.titulo)}</a></h3>
              <p class="tenue">${esc(l.autor)}</p>
              <p class="progreso"><progress max="100" value="${p}" aria-label="Progreso de lectura"></progress> ${p} % leído</p>
              <a class="btn btn--chico" href="#/leer/${l.id}">${p ? 'Seguir leyendo' : 'Empezar a leer'}</a>
            </div></li>`;
        }).join('')}</ul>` : '<div class="vacio"><p>Aún no tienes libros digitales. Agrega uno gratis de la lista de abajo o compra la versión digital de un libro.</p></div>'}
      </section>
      ${gratis.length ? `<section class="bloque" aria-labelledby="t-gratis">
        <h2 id="t-gratis">Gratis, de dominio público</h2>
        <p>Obras cuyos derechos de autor ya expiraron. Puedes leerlas sin costo.</p>
        <ul class="estanteria">${gratis.map(l => `<li class="libro-digital">
          ${LC.portada(l, 'portada--mini')}
          <div><h3>${esc(l.titulo)}</h3><p class="tenue">${esc(l.autor)}</p>
          <button class="btn btn--chico" data-action="agregar-biblioteca" data-id="${l.id}">Agregar a mi biblioteca</button></div></li>`).join('')}</ul>
      </section>` : ''}
      ${conLicencia.length ? `<section class="bloque" aria-labelledby="t-venta">
        <h2 id="t-venta">Disponibles en digital</h2>
        <div class="fila-libros">${conLicencia.map(l => `<article class="libro">
          <a href="#/libro/${l.id}" class="libro__enlace">${LC.portada(l)}<h3 class="libro__titulo">${esc(l.titulo)}</h3></a>
          <p class="libro__autor">${esc(l.autor)}</p><p class="libro__precio">${LC.precioHTML(l, 'digital')}</p>
          <button class="btn btn--chico" data-action="agregar" data-id="${l.id}" data-formato="digital">Comprar versión digital</button></article>`).join('')}</div>
      </section>` : ''}
      <section class="bloque nota" aria-labelledby="t-licencias">
        <h2 id="t-licencias">Sobre las licencias</h2>
        <p>Los libros con derechos de autor vigentes se venden con una licencia de lectura personal que entrega la distribuidora digital. Se leen dentro de tu cuenta, y la IA de lectura solo se activa cuando la licencia lo permite.</p>
      </section>`);
  };
  A['agregar-biblioteca'] = b => { LC.agregarABiblioteca(b.dataset.id); LC.toast(`«${LC.libro(b.dataset.id).titulo}» está en tu biblioteca.`); LC.refrescar(); };

  /* ============ 18, 20 y 21. Lector digital interactivo ============ */
  const LECTOR_BASE = { tam: 112, tema: 'claro', fuente: 'literata', interlineado: 1.75 };

  /* Marca los subrayados guardados dentro de un párrafo ya escapado */
  const conSubrayados = (texto, subrayados, clave) => {
    let html = esc(texto);
    subrayados.filter(s => s.p === clave).forEach(s => {
      const frag = esc(s.texto);
      const i = html.indexOf(frag);
      if (i >= 0) html = html.slice(0, i) + `<mark>${frag}</mark>` + html.slice(i + frag.length);
    });
    return html.replace(/\n/g, '<br>');
  };

  /* Envuelve cada palabra en un span para poder traducirla con un clic */
  const envolverPalabras = raiz => {
    const caminante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
    const nodos = [];
    while (caminante.nextNode()) nodos.push(caminante.currentNode);
    nodos.forEach(n => {
      if (!n.textContent.trim() || n.parentElement.closest('.w')) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/([A-Za-z][A-Za-z'’-]*)/).forEach((parte, i) => {
        if (i % 2) { const s = document.createElement('span'); s.className = 'w'; s.textContent = parte; frag.appendChild(s); }
        else if (parte) frag.appendChild(document.createTextNode(parte));
      });
      n.replaceWith(frag);
    });
  };

  const traducir = palabra => {
    const p = palabra.toLowerCase().replace(/[’']s$/, '').replace(/[’']/g, '');
    return LC.DICCIONARIO[p] || LC.DICCIONARIO[p.replace(/-/g, '')] || null;
  };
  LC.traducir = traducir;

  V.leer = ([id]) => {
    const l = LC.libro(id);
    if (!l) return V.noEncontrado();
    const txt = l.texto && LC.TEXTOS[l.texto];
    if (!txt) {
      return LC.pintar(l.titulo, `${encabezado(esc(l.titulo), esc(l.autor))}
        <div class="vacio"><p>Este libro se lee con el archivo que entrega la distribuidora digital (EPUB con licencia). En esta demostración no hay un archivo cargado para este título.</p>
        <div class="fila-botones"><a class="btn" href="#/biblioteca">Volver a la biblioteca</a><a class="btn" href="#/leer/quijote">Probar el lector con Don Quijote</a></div></div>`);
    }
    const lp = { ...LECTOR_BASE, ...LC.leer('lector', {}) };
    const en = txt.idioma === 'en';
    const subrayados = (LC.leer('subrayados', {})[id]) || [];
    const permiteIA = l.dominioPublico;
    const esMuestra = !LC.enBiblioteca(id) && LC.precio(l, 'digital') > 0;

    LC.pintar(`Leyendo ${l.titulo}`, `
    <div class="lector" id="lector" data-tema="${lp.tema}" data-fuente="${lp.fuente}" style="--lector-tam:${lp.tam}%;--lector-ih:${lp.interlineado}">
      <div class="lector__barra">
        <a class="btn-icono" href="#/biblioteca" aria-label="Volver a la biblioteca">${icono('flecha')}</a>
        <h1 class="lector__titulo" tabindex="-1">${esc(l.titulo)} <span class="tenue">${esc(l.autor)}</span></h1>
        <div class="lector__controles" role="toolbar" aria-label="Herramientas de lectura">
          <button class="btn-icono" data-lector="menos" aria-label="Achicar letra"><span aria-hidden="true">A−</span></button>
          <button class="btn-icono" data-lector="mas" aria-label="Agrandar letra"><span aria-hidden="true">A+</span></button>
          <label class="sr" for="lector-tema">Tema del lector</label>
          <select id="lector-tema" data-lector="tema">${[['claro', 'Claro'], ['sepia', 'Sepia'], ['noche', 'Noche']].map(([v, t]) => `<option value="${v}" ${lp.tema === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <label class="sr" for="lector-fuente">Tipo de letra</label>
          <select id="lector-fuente" data-lector="fuente">${[['literata', 'Literata'], ['atkinson', 'Atkinson'], ['lexend', 'Lexend']].map(([v, t]) => `<option value="${v}" ${lp.fuente === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <button class="btn-icono" data-lector="voz" aria-pressed="false" aria-label="Leer en voz alta">${icono('volumen')}</button>
          <button class="btn-icono" data-lector="marcador" aria-label="Guardar marcador aquí">${icono('marcador')}</button>
          ${en ? '<button class="btn btn--chico" data-lector="traduccion" aria-pressed="false">Ver traducción</button>' : ''}
          <button class="btn btn--chico" data-lector="panel" aria-expanded="false" aria-controls="lector-panel">${icono('chispa')} IA de lectura</button>
        </div>
        <div class="lector__progreso" aria-hidden="true"><span id="barra-progreso"></span></div>
      </div>
      <div class="lector__cuerpo">
        <article class="lector__texto ${txt.verso ? 'lector__texto--verso' : ''}" id="texto" lang="${en ? 'en' : 'es'}">
          ${esMuestra ? '<p class="aviso">Estás leyendo la muestra gratuita. Compra la versión digital para leer el libro completo.</p>' : ''}
          ${txt.capitulos.map((c, ci) => `<h2>${esc(c.titulo)}</h2>${c.parrafos.map((p, pi) => `<p data-p="${ci}-${pi}">${conSubrayados(p, subrayados, `${ci}-${pi}`)}</p>${en && txt.traduccion ? `<p class="traduccion" lang="es" hidden>${esc(txt.traduccion[pi])}</p>` : ''}`).join('')}`).join('')}
          <p class="lector__fin tenue">Fin del fragmento disponible en esta demostración.</p>
        </article>
        <aside class="lector__panel" id="lector-panel" hidden aria-labelledby="t-ia">
          <div class="lector__panel-cab"><h2 id="t-ia">IA de lectura</h2><button class="btn-icono" data-lector="panel" aria-label="Cerrar IA de lectura">${icono('cerrar')}</button></div>
          ${permiteIA ? `
          <div class="pestanas" role="tablist" aria-label="Herramientas de IA">
            ${[['resumen', 'Resumen'], ['glosario', en ? 'Vocabulario' : 'Glosario'], ['preguntas', 'Preguntas'], ['subrayados', 'Subrayados']].map(([k, t], i) => `<button role="tab" id="tab-${k}" aria-controls="panel-ia" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${k}">${t}</button>`).join('')}
          </div>
          <div id="panel-ia" role="tabpanel" class="panel-ia" tabindex="0"></div>
          <form id="form-ia" class="form-ia">
            <label for="pregunta-ia">Pregunta sobre el texto</label>
            <textarea id="pregunta-ia" rows="2" placeholder="${en ? 'Por ejemplo: ¿qué significa peeped?' : 'Por ejemplo: ¿qué es un hidalgo?'}"></textarea>
            <button class="btn btn--chico">Preguntar</button>
            <div id="respuesta-ia" class="respuesta-ia" aria-live="polite"></div>
          </form>
          <p class="tenue chico">Selecciona un pasaje para que la IA lo explique. Respuestas locales de demostración; para respuestas libres se conecta un servicio de IA en js/data.js.</p>`
          : `<p>La IA de lectura no está disponible para este libro: la licencia de la editorial no permite procesar el texto.</p>`}
        </aside>
      </div>
      <div class="menu-seleccion" id="menu-seleccion" hidden role="toolbar" aria-label="Acciones sobre el texto seleccionado">
        <button data-sel="subrayar">Subrayar</button>
        ${permiteIA ? '<button data-sel="explicar">Explicar</button>' : ''}
        ${en ? '<button data-sel="traducir">Traducir</button>' : ''}
        <button data-sel="escuchar">Escuchar</button>
      </div>
      <div class="popover-palabra" id="popover" hidden role="dialog" aria-label="Traducción de la palabra"></div>
    </div>`);

    const lector = $('#lector'), texto = $('#texto'), panel = $('#lector-panel');
    const guardarLP = cambios => { Object.assign(lp, cambios); LC.guardar('lector', lp); };
    if (en) envolverPalabras(texto);

    /* Controles de apariencia */
    lector.addEventListener('click', e => {
      const b = e.target.closest('[data-lector]');
      if (!b || b.tagName === 'SELECT') return;
      const accion = b.dataset.lector;
      if (accion === 'mas' || accion === 'menos') {
        const tam = Math.max(80, Math.min(200, lp.tam + (accion === 'mas' ? 10 : -10)));
        guardarLP({ tam });
        lector.style.setProperty('--lector-tam', tam + '%');
      }
      if (accion === 'panel') {
        const abrir = panel.hidden;
        panel.hidden = !abrir;
        $$('[data-lector="panel"][aria-expanded]').forEach(x => x.setAttribute('aria-expanded', abrir));
        if (abrir) $('#tab-resumen, #lector-panel p')?.focus();
      }
      if (accion === 'traduccion') {
        const activo = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', activo);
        b.textContent = activo ? 'Ocultar traducción' : 'Ver traducción';
        $$('.traduccion', texto).forEach(t => { t.hidden = !activo; });
      }
      if (accion === 'marcador') {
        const visible = $$('p[data-p]', texto).find(p => p.getBoundingClientRect().bottom > 120);
        if (visible) {
          const m = LC.leer('marcadores', {}); m[id] = visible.dataset.p; LC.guardar('marcadores', m);
          LC.toast('Marcador guardado. La próxima vez abrirás el libro aquí.');
        }
      }
      if (accion === 'voz') alternarLectura(b);
    });
    lector.addEventListener('change', e => {
      const s = e.target.closest('select[data-lector]');
      if (!s) return;
      guardarLP({ [s.dataset.lector]: s.value });
      lector.dataset[s.dataset.lector] = s.value;
    });

    /* Lectura en voz alta párrafo por párrafo, resaltando el que se está leyendo */
    let leyendo = false;
    const alternarLectura = b => {
      if (leyendo) { leyendo = false; LC.callar(); $$('.leyendo', texto).forEach(p => p.classList.remove('leyendo')); b.setAttribute('aria-pressed', 'false'); return; }
      const parrafos = $$('p[data-p]', texto);
      let i = Math.max(0, parrafos.findIndex(p => p.getBoundingClientRect().bottom > 120));
      leyendo = true;
      b.setAttribute('aria-pressed', 'true');
      const siguiente = () => {
        $$('.leyendo', texto).forEach(p => p.classList.remove('leyendo'));
        if (!leyendo || i >= parrafos.length) { leyendo = false; b.setAttribute('aria-pressed', 'false'); return; }
        const p = parrafos[i++];
        p.classList.add('leyendo');
        p.scrollIntoView({ block: 'center', behavior: LC.prefs().movimiento ? 'auto' : 'smooth' });
        LC.hablar(p.textContent, txt.idioma, siguiente);
      };
      siguiente();
    };

    /* Progreso de lectura */
    const barra = $('#barra-progreso');
    const medir = () => {
      const r = texto.getBoundingClientRect();
      const pct = Math.round(Math.max(0, Math.min(1, (innerHeight - r.top) / r.height)) * 100);
      barra.style.width = pct + '%';
      return pct;
    };
    let tGuardar;
    const alScroll = () => {
      const pct = medir();
      clearTimeout(tGuardar);
      tGuardar = setTimeout(() => { const p = LC.leer('progreso', {}); if (pct > (p[id] || 0)) { p[id] = pct; LC.guardar('progreso', p); } }, 400);
    };
    addEventListener('scroll', alScroll, { passive: true });
    LC.alSalir(() => { removeEventListener('scroll', alScroll); leyendo = false; });
    const marcador = LC.leer('marcadores', {})[id];
    if (marcador) {
      const p = $(`p[data-p="${marcador}"]`, texto);
      if (p) { setTimeout(() => { p.scrollIntoView({ block: 'start' }); scrollBy(0, -110); medir(); }, 0); LC.toast('Abriste el libro en tu marcador.'); }
    }
    medir();

    /* Menú contextual al seleccionar texto */
    const menu = $('#menu-seleccion');
    let seleccion = null;
    const mostrarMenu = () => {
      const sel = getSelection();
      const t = sel.toString().trim();
      if (!t || t.length < 2 || !sel.rangeCount) { menu.hidden = true; return; }
      const pA = sel.anchorNode && sel.anchorNode.parentElement && sel.anchorNode.parentElement.closest('p[data-p]');
      const pF = sel.focusNode && sel.focusNode.parentElement && sel.focusNode.parentElement.closest('p[data-p]');
      if (!pA || pA !== pF || !texto.contains(pA)) { menu.hidden = true; return; }
      seleccion = { texto: sel.toString(), parrafo: pA };
      const r = sel.getRangeAt(0).getBoundingClientRect();
      menu.hidden = false;
      menu.style.top = (scrollY + r.top - menu.offsetHeight - 8) + 'px';
      menu.style.left = Math.max(8, Math.min(innerWidth - menu.offsetWidth - 8, r.left + r.width / 2 - menu.offsetWidth / 2)) + 'px';
    };
    texto.addEventListener('mouseup', () => setTimeout(mostrarMenu, 0));
    texto.addEventListener('keyup', e => { if (e.shiftKey) mostrarMenu(); });
    const alCambiarSeleccion = () => { if (!getSelection().toString().trim()) setTimeout(() => { if (!menu.contains(document.activeElement)) menu.hidden = true; }, 150); };
    document.addEventListener('selectionchange', alCambiarSeleccion);
    LC.alSalir(() => document.removeEventListener('selectionchange', alCambiarSeleccion));

    menu.addEventListener('click', e => {
      const b = e.target.closest('[data-sel]');
      if (!b || !seleccion) return;
      const { texto: sel, parrafo } = seleccion;
      menu.hidden = true;
      if (b.dataset.sel === 'subrayar') {
        const todos = LC.leer('subrayados', {});
        const lista = todos[id] = todos[id] || [];
        const limpio = sel.replace(/\r/g, '');
        if (!lista.some(s => s.p === parrafo.dataset.p && s.texto === limpio)) lista.push({ p: parrafo.dataset.p, texto: limpio, fecha: new Date().toISOString() });
        LC.guardar('subrayados', todos);
        const [ci, pi] = parrafo.dataset.p.split('-').map(Number);
        parrafo.innerHTML = conSubrayados(txt.capitulos[ci].parrafos[pi], lista, parrafo.dataset.p);
        if (en) envolverPalabras(parrafo);
        getSelection().removeAllRanges();
        LC.toast('Subrayado guardado.');
        if (!panel.hidden && pestana === 'subrayados') pintarPestana('subrayados');
      }
      if (b.dataset.sel === 'escuchar') LC.hablar(sel, txt.idioma);
      if (b.dataset.sel === 'explicar' || b.dataset.sel === 'traducir') {
        if (panel.hidden) $('[data-lector="panel"][aria-expanded]').click();
        explicar(sel, parrafo, b.dataset.sel === 'traducir');
      }
    });

    /* Traducción al tocar una palabra (modo idiomas) */
    const pop = $('#popover');
    if (en) {
      texto.addEventListener('click', e => {
        const w = e.target.closest('.w');
        if (!w || getSelection().toString().trim()) return;
        const palabra = w.textContent;
        const tr = traducir(palabra);
        const r = w.getBoundingClientRect();
        pop.innerHTML = `<p class="popover-palabra__en" lang="en">${esc(palabra)}</p><p>${tr ? esc(tr) : 'Esta palabra aún no está en el diccionario de la demostración.'}</p>
          <div class="fila-botones"><button class="btn btn--chico" data-pop="oir">${icono('volumen')} Escuchar</button>${tr ? '<button class="btn btn--chico" data-pop="guardar">Guardar</button>' : ''}<button class="btn-icono" data-pop="cerrar" aria-label="Cerrar">${icono('cerrar')}</button></div>`;
        pop.hidden = false;
        pop.style.top = (scrollY + r.bottom + 8) + 'px';
        pop.style.left = Math.max(8, Math.min(innerWidth - 280, r.left - 20)) + 'px';
        pop.dataset.palabra = palabra.toLowerCase();
        pop.dataset.tr = tr || '';
        $('[data-pop="oir"]', pop).focus();
      });
      pop.addEventListener('click', e => {
        const b = e.target.closest('[data-pop]');
        if (!b) return;
        if (b.dataset.pop === 'oir') LC.hablar(pop.dataset.palabra, 'en');
        if (b.dataset.pop === 'guardar') { LC.guardarPalabra(pop.dataset.palabra, pop.dataset.tr); pop.hidden = true; }
        if (b.dataset.pop === 'cerrar') pop.hidden = true;
      });
      pop.addEventListener('keydown', e => { if (e.key === 'Escape') pop.hidden = true; });
    }

    /* Pestañas del panel de IA */
    let pestana = 'resumen';
    const pintarPestana = k => {
      pestana = k;
      const zona = $('#panel-ia');
      if (!zona) return;
      $$('[role="tab"]', panel).forEach(t => { const sel = t.dataset.tab === k; t.setAttribute('aria-selected', sel); t.tabIndex = sel ? 0 : -1; });
      zona.setAttribute('aria-labelledby', 'tab-' + k);
      if (k === 'resumen') zona.innerHTML = `<p>${esc(txt.ia.resumen)}</p><button class="btn btn--chico" data-ia="oir-resumen">${icono('volumen')} Escuchar resumen</button>`;
      if (k === 'glosario') {
        const entradas = en ? Object.entries(LC.DICCIONARIO).slice(0, 40) : Object.entries(txt.ia.glosario);
        zona.innerHTML = `<dl class="glosario">${entradas.map(([p, d]) => `<div><dt ${en ? 'lang="en"' : ''}>${esc(p)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>`;
      }
      if (k === 'preguntas') zona.innerHTML = `<p>Para pensar o conversar en el club:</p><ul class="lista-preguntas">${txt.ia.preguntas.map(p => `<li ${en ? 'lang="en"' : ''}>${esc(p)}</li>`).join('')}</ul>`;
      if (k === 'subrayados') {
        const lista = (LC.leer('subrayados', {})[id]) || [];
        zona.innerHTML = lista.length ? `<ul class="lista-subrayados">${lista.map((s, i) => `<li><mark>${esc(s.texto)}</mark><button class="enlace-accion" data-ia="quitar-subrayado" data-i="${i}">Quitar</button></li>`).join('')}</ul>`
          : '<p>Selecciona un pasaje del texto y elige «Subrayar» para guardarlo aquí.</p>';
      }
    };
    if (permiteIA) {
      pintarPestana('resumen');
      const tabs = $('.pestanas', panel);
      tabs.addEventListener('click', e => { const t = e.target.closest('[role="tab"]'); if (t) pintarPestana(t.dataset.tab); });
      tabs.addEventListener('keydown', e => {
        if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        const todas = $$('[role="tab"]', tabs);
        const i = todas.findIndex(t => t.dataset.tab === pestana);
        const nueva = todas[(i + (e.key === 'ArrowRight' ? 1 : todas.length - 1)) % todas.length];
        pintarPestana(nueva.dataset.tab);
        nueva.focus();
      });
      $('#panel-ia').addEventListener('click', e => {
        const b = e.target.closest('[data-ia]');
        if (!b) return;
        if (b.dataset.ia === 'oir-resumen') LC.hablar(txt.ia.resumen, 'es');
        if (b.dataset.ia === 'quitar-subrayado') {
          const todos = LC.leer('subrayados', {});
          const [quitado] = todos[id].splice(+b.dataset.i, 1);
          LC.guardar('subrayados', todos);
          const parrafo = $(`p[data-p="${quitado.p}"]`, texto);
          if (parrafo) {
            const [ci, pi] = quitado.p.split('-').map(Number);
            parrafo.innerHTML = conSubrayados(txt.capitulos[ci].parrafos[pi], todos[id], quitado.p);
            if (en) envolverPalabras(parrafo);
          }
          pintarPestana('subrayados');
        }
      });
      $('#form-ia').addEventListener('submit', async e => {
        e.preventDefault();
        const pregunta = $('#pregunta-ia').value.trim();
        if (!pregunta) return;
        const out = $('#respuesta-ia');
        out.innerHTML = '<p class="tenue">Pensando…</p>';
        const remota = await LC.ia.pedir('lectura', { libro: l.titulo, pregunta, contexto: txt.capitulos.map(c => c.parrafos.join('\n')).join('\n\n') });
        out.innerHTML = `<p>${esc(remota || responderLocal(pregunta))}</p>`;
      });
    }

    /* Respuestas locales: buscan en el glosario, el diccionario y el material preparado */
    const terminosEn = s => LC.normalizar(s).replace(/[^a-z0-9ñ\s'-]/g, ' ');
    const responderLocal = pregunta => {
      const q = terminosEn(pregunta);
      const glosario = Object.entries(txt.ia.glosario).filter(([p]) => q.includes(LC.normalizar(p)));
      if (glosario.length) return glosario.map(([p, d]) => `«${p}»: ${d}`).join(' ');
      if (en) {
        const palabras = q.split(/\s+/).map(w => [w, traducir(w)]).filter(([w, t]) => t && w.length > 2 && !['que', 'significa'].includes(w));
        if (palabras.length) return palabras.map(([w, t]) => `«${w}» significa ${t}.`).join(' ');
      }
      if (/resum|trata|de que/.test(q)) return txt.ia.resumen;
      if (/pregunta|discut|conversar|club/.test(q)) return 'Algunas preguntas para conversar: ' + txt.ia.preguntas.join(' ');
      return 'En esta demostración respondo con el material preparado para esta obra: resumen, glosario y preguntas. Prueba preguntando por una palabra del texto. Para preguntas libres hay que conectar el servicio de IA.';
    };
    const explicar = (sel, parrafo, soloTraducir) => {
      const out = $('#respuesta-ia');
      if (!out) return;
      $('#pregunta-ia').value = soloTraducir ? `Traducir: «${sel.trim()}»` : `Explicar: «${sel.trim()}»`;
      let respuesta;
      if (en) {
        const [, pi] = parrafo.dataset.p.split('-').map(Number);
        const palabras = sel.match(/[A-Za-z][A-Za-z'’-]*/g) || [];
        const glosas = palabras.slice(0, 12).map(w => `${w}: ${traducir(w) || '¿?'}`).join('; ');
        respuesta = `${glosas}.` + (palabras.length > 4 && txt.traduccion ? ` Traducción del párrafo: ${txt.traduccion[pi]}` : '');
      } else respuesta = responderLocal(sel);
      out.innerHTML = `<p>${esc(respuesta)}</p>`;
    };
  };

  /* Vocabulario guardado para el modo idiomas */
  LC.guardarPalabra = (en, es) => {
    const vocab = LC.leer('vocab', []);
    if (vocab.some(v => v.en === en)) { LC.toast(`«${en}» ya está en tu vocabulario.`); return; }
    vocab.push({ en, es, caja: 1, fecha: new Date().toISOString() });
    LC.guardar('vocab', vocab);
    LC.toast(`«${en}» se guardó en tu vocabulario.`);
  };

  /* ============ 19. Club de lectura y videollamadas ============ */
  V.club = () => {
    const mios = LC.leer('clubes', []);
    LC.pintar('Club de lectura', `${encabezado('Club de lectura', 'Grupos que leen juntos, en la tienda o por videollamada desde cualquier lugar.')}
      <ul class="clubes">${LC.CLUBES.map(c => {
        const l = LC.libro(c.libro), unido = mios.includes(c.id);
        return `<li class="club">
          ${LC.portada(l, 'portada--mini')}
          <div class="club__info">
            <h2>${c.nombre}</h2>
            <p class="club__cuando">${c.cuando}</p>
            <p>${c.desc}</p>
            <p class="tenue">Leyendo ahora: <a href="#/libro/${l.id}">${esc(l.titulo)}</a></p>
            <div class="fila-botones">
              <button class="btn ${unido ? '' : 'btn--primario'}" data-action="unirse-club" data-id="${c.id}" aria-pressed="${unido}">${unido ? `${icono('check')} Eres parte del club` : 'Unirme al club'}</button>
              <a class="btn" href="#/club/${c.id}">${icono('video')} Entrar a la sala</a>
            </div>
          </div></li>`;
      }).join('')}</ul>`);
  };
  A['unirse-club'] = b => {
    const mios = LC.leer('clubes', []);
    const c = LC.CLUBES.find(x => x.id === b.dataset.id);
    const i = mios.indexOf(c.id);
    if (i >= 0) { mios.splice(i, 1); LC.toast(`Saliste de ${c.nombre}.`); }
    else { mios.push(c.id); LC.notificar('club', `Te uniste a ${c.nombre}`, `Nos vemos el ${c.cuando.toLowerCase()}. Te recordaremos cada sesión.`, '#/club/' + c.id); LC.toast(`Te uniste a ${c.nombre}.`); }
    LC.guardar('clubes', mios);
    LC.refrescar();
  };

  V.sala = ([id]) => {
    const c = LC.CLUBES.find(x => x.id === id);
    if (!c) return V.noEncontrado();
    const l = LC.libro(c.libro), txt = LC.TEXTOS[l.texto];
    const parrafos = txt ? txt.capitulos.flatMap(ch => ch.parrafos) : [];
    const u = LC.usuario();
    const sala = `${LC.CONFIG.salaPrefijo}-${c.id}`;
    LC.pintar(`Sala: ${c.nombre}`, `
      <nav class="migas" aria-label="Ruta"><a href="#/club">Club de lectura</a></nav>
      ${encabezado(c.nombre, `${c.cuando}. Leyendo «${esc(l.titulo)}».`)}
      <div class="sala">
        <section class="sala__video" aria-labelledby="t-video">
          <h2 id="t-video" class="sr">Videollamada</h2>
          <div id="video-zona" class="video-zona">
            <div class="video-zona__inicio">
              <p>La videollamada usa Jitsi Meet: es gratuita y no hay que instalar nada. Tu navegador te pedirá permiso para usar la cámara y el micrófono.</p>
              <div class="fila-botones">
                <button class="btn btn--primario" id="btn-video">${icono('video')} Entrar a la videollamada</button>
                <button class="btn" id="btn-camara">Probar cámara y micrófono</button>
              </div>
            </div>
          </div>
        </section>
        <section class="sala__lectura" aria-labelledby="t-compartida">
          <div class="sala__cab"><h2 id="t-compartida">Lectura compartida</h2><p class="tenue" aria-live="polite">Párrafo <span id="parrafo-actual">1</span> de ${parrafos.length}</p></div>
          <div class="sala__texto ${txt && txt.verso ? 'lector__texto--verso' : ''}" id="sala-texto" lang="${txt && txt.idioma === 'en' ? 'en' : 'es'}">${parrafos.map((p, i) => `<p data-i="${i}">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>
          <div class="fila-botones"><button class="btn btn--chico" id="sala-ant">Párrafo anterior</button><button class="btn btn--chico" id="sala-sig">Párrafo siguiente</button></div>
        </section>
        <section class="sala__chat" aria-labelledby="t-chat">
          <h2 id="t-chat">Chat del grupo</h2>
          <ul id="chat" class="chat" aria-live="polite"></ul>
          <form id="form-chat" class="fila-input"><label class="sr" for="chat-msg">Mensaje</label><input id="chat-msg" autocomplete="off" maxlength="300" placeholder="Escribe un mensaje"><button class="btn btn--chico">Enviar</button></form>
        </section>
      </div>
      <p class="tenue chico">El párrafo compartido y el chat se sincronizan entre pestañas de este navegador. Para sincronizarlos entre todas las personas del club se necesita un servidor en tiempo real (WebSocket).</p>`);

    /* Videollamada con Jitsi Meet */
    $('#btn-video').addEventListener('click', () => {
      detenerCamara();
      const nombre = encodeURIComponent(JSON.stringify(u ? u.nombre : 'Lector'));
      $('#video-zona').innerHTML = `<iframe class="video-iframe" title="Videollamada de ${esc(c.nombre)}" src="https://meet.jit.si/${encodeURIComponent(sala)}#userInfo.displayName=${nombre}&config.prejoinPageEnabled=true" allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"></iframe>`;
    });
    let flujo = null;
    const detenerCamara = () => { if (flujo) { flujo.getTracks().forEach(t => t.stop()); flujo = null; } };
    $('#btn-camara').addEventListener('click', async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { LC.toast('Tu navegador no permite usar la cámara desde esta página.', 'error'); return; }
      try {
        flujo = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        $('#video-zona').innerHTML = `<video class="video-prueba" autoplay muted playsinline aria-label="Vista previa de tu cámara"></video><div class="fila-botones"><button class="btn btn--chico" id="btn-parar">Terminar prueba</button></div>`;
        $('.video-prueba').srcObject = flujo;
        $('#btn-parar').addEventListener('click', () => { detenerCamara(); LC.refrescar(); });
      } catch (err) {
        LC.toast(err.name === 'NotAllowedError' ? 'No diste permiso para usar la cámara. Puedes activarlo en la barra de direcciones.' : 'No encontramos una cámara disponible.', 'error');
      }
    });

    /* Párrafo compartido y chat (BroadcastChannel entre pestañas) */
    const canal = 'BroadcastChannel' in window ? new BroadcastChannel('lc-sala-' + id) : null;
    let actual = LC.leer('sala:' + id, 0);
    const marcar = (i, emitir) => {
      actual = Math.max(0, Math.min(parrafos.length - 1, i));
      $$('#sala-texto p').forEach(p => p.classList.toggle('actual', +p.dataset.i === actual));
      $('#parrafo-actual').textContent = actual + 1;
      const p = $(`#sala-texto p[data-i="${actual}"]`);
      if (p) $('#sala-texto').scrollTop = p.offsetTop - 16;
      LC.guardar('sala:' + id, actual);
      if (emitir && canal) canal.postMessage({ tipo: 'parrafo', i: actual });
    };
    $('#sala-ant').addEventListener('click', () => marcar(actual - 1, true));
    $('#sala-sig').addEventListener('click', () => marcar(actual + 1, true));
    marcar(actual, false);

    const chat = LC.leer('chat:' + id, []);
    const pintarChat = () => {
      $('#chat').innerHTML = chat.length ? chat.slice(-50).map(m => `<li><strong>${esc(m.nombre)}</strong> <span class="tenue">${LC.fecha(m.fecha, true)}</span><p>${esc(m.texto)}</p></li>`).join('')
        : '<li class="tenue">Todavía no hay mensajes. Saluda al grupo.</li>';
      $('#chat').scrollTop = 1e6;
    };
    pintarChat();
    $('#form-chat').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#chat-msg');
      if (!input.value.trim()) return;
      const m = { nombre: u ? u.nombre : 'Lector', texto: input.value.trim(), fecha: new Date().toISOString() };
      chat.push(m);
      LC.guardar('chat:' + id, chat.slice(-100));
      if (canal) canal.postMessage({ tipo: 'chat', m });
      input.value = '';
      pintarChat();
    });
    if (canal) canal.onmessage = e => {
      if (e.data.tipo === 'parrafo') marcar(e.data.i, false);
      if (e.data.tipo === 'chat') { chat.push(e.data.m); pintarChat(); }
    };
    LC.alSalir(() => { detenerCamara(); if (canal) canal.close(); });
  };

  /* ============ 21. Aprendizaje de idiomas ============ */
  V.idiomas = () => {
    const vocab = LC.leer('vocab', []);
    const lecturas = LC.catalogo().filter(l => l.texto && LC.TEXTOS[l.texto] && LC.TEXTOS[l.texto].idioma !== 'es');
    const cajas = [1, 2, 3, 4, 5].map(n => vocab.filter(v => v.caja === n).length);
    LC.pintar('Aprender idiomas', `${encabezado('Aprende inglés leyendo', 'Lee textos originales, toca cualquier palabra para ver su traducción y guárdala para repasarla.')}
    <div class="idiomas">
      <section aria-labelledby="t-lecturas">
        <h2 id="t-lecturas">Lecturas</h2>
        <ul class="estanteria">${lecturas.map(l => `<li class="libro-digital">${LC.portada(l, 'portada--mini')}<div>
          <h3>${esc(l.titulo)}</h3><p class="tenue">${esc(l.autor)}. Nivel intermedio.</p>
          <a class="btn btn--chico btn--primario" href="#/leer/${l.id}">Leer con traducción</a></div></li>`).join('')}</ul>
        <p class="tenue">Francés y portugués: en preparación.</p>

        <h2>Tu vocabulario</h2>
        ${vocab.length ? `<table class="tabla">
          <thead><tr><th scope="col">Inglés</th><th scope="col">Español</th><th scope="col">Nivel</th><th scope="col"><span class="sr">Acciones</span></th></tr></thead>
          <tbody>${vocab.map((v, i) => `<tr><td lang="en">${esc(v.en)}</td><td>${esc(v.es)}</td><td>${v.caja} de 5</td>
            <td class="celda-acciones"><button class="btn-icono" data-action="oir-palabra" data-palabra="${esc(v.en)}" aria-label="Escuchar ${esc(v.en)}">${icono('volumen')}</button><button class="btn-icono" data-action="quitar-palabra" data-i="${i}" aria-label="Quitar ${esc(v.en)}">${icono('basura')}</button></td></tr>`).join('')}</tbody>
        </table>` : `<div class="vacio"><p>Todavía no guardas palabras. Abre una lectura y toca una palabra para guardarla.</p><button class="btn btn--chico" data-action="vocab-ejemplo">Cargar palabras de ejemplo</button></div>`}
      </section>
      <section class="repaso" aria-labelledby="t-repaso">
        <h2 id="t-repaso">Repaso con tarjetas</h2>
        <div id="tarjeta-repaso"></div>
        ${vocab.length ? `<p class="tenue chico">Palabras por nivel, de 1 (nueva) a 5 (dominada): ${cajas.join(', ')}.</p>` : ''}
      </section>
    </div>`);

    const zona = $('#tarjeta-repaso');
    const siguienteTarjeta = () => {
      const lista = LC.leer('vocab', []);
      if (!lista.length) { zona.innerHTML = '<p>Guarda palabras para empezar a repasar.</p>'; return; }
      const v = [...lista].sort((a, b) => a.caja - b.caja || new Date(a.fecha) - new Date(b.fecha))[0];
      zona.innerHTML = `<div class="tarjeta-repaso">
        <p class="tarjeta-repaso__palabra" lang="en">${esc(v.en)}</p>
        <button class="btn btn--chico" id="rep-oir">${icono('volumen')} Escuchar</button>
        <p class="tarjeta-repaso__respuesta" id="rep-resp" hidden>${esc(v.es)}</p>
        <div class="fila-botones" id="rep-mostrar"><button class="btn btn--primario" id="rep-ver">Mostrar traducción</button></div>
        <div class="fila-botones" id="rep-botones" hidden><button class="btn" data-r="no">Todavía no</button><button class="btn btn--primario" data-r="si">La sabía</button></div>
      </div>`;
      $('#rep-oir').addEventListener('click', () => LC.hablar(v.en, 'en'));
      $('#rep-ver').addEventListener('click', () => { $('#rep-resp').hidden = false; $('#rep-mostrar').hidden = true; $('#rep-botones').hidden = false; $('#rep-botones [data-r="si"]').focus(); });
      $$('#rep-botones [data-r]').forEach(b => b.addEventListener('click', () => {
        const todas = LC.leer('vocab', []);
        const x = todas.find(y => y.en === v.en);
        x.caja = b.dataset.r === 'si' ? Math.min(5, x.caja + 1) : 1;
        x.fecha = new Date().toISOString();
        LC.guardar('vocab', todas);
        siguienteTarjeta();
        $('#rep-ver')?.focus();
      }));
    };
    siguienteTarjeta();
  };
  A['oir-palabra'] = b => LC.hablar(b.dataset.palabra, 'en');
  A['quitar-palabra'] = b => { const v = LC.leer('vocab', []); v.splice(+b.dataset.i, 1); LC.guardar('vocab', v); LC.refrescar(); };
  A['vocab-ejemplo'] = () => {
    ['rabbit', 'tired', 'sister', 'pictures', 'suddenly', 'daisies'].forEach(w => {
      const v = LC.leer('vocab', []);
      if (!v.some(x => x.en === w)) { v.push({ en: w, es: LC.DICCIONARIO[w], caja: 1, fecha: new Date().toISOString() }); LC.guardar('vocab', v); }
    });
    LC.refrescar();
  };
})();
