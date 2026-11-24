/* Funciones globales: IA (5, 16, 20), biometría con passkeys (12), navegación por voz (4),
   asistente virtual (5), intérprete LSCh (8) y panel de colores y accesibilidad (6, 7). */
(function () {
  const LC = window.LC;
  const { esc, clp, icono, $, $$ } = LC;
  const A = LC.acciones = LC.acciones || {};

  /* ---------- Adaptador de IA ----------
     Si CONFIG.iaEndpoint apunta a tu backend, se usan respuestas reales del modelo.
     Si no, cada módulo usa su respuesta local de demostración. */
  LC.ia = {
    async pedir(tipo, datos) {
      if (!LC.CONFIG.iaEndpoint) return null;
      try {
        const r = await fetch(LC.CONFIG.iaEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo, ...datos }) });
        if (!r.ok) return null;
        const j = await r.json();
        return j.texto || null;
      } catch { return null; }
    },
  };

  /* ---------- 12. Confirmación biométrica con passkeys (WebAuthn) ----------
     Reemplaza el "pago por reconocimiento ocular": el sensor es el del propio dispositivo y
     ningún dato biométrico sale de él. En producción, el desafío lo genera y verifica el servidor. */
  const aB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  LC.biometria = {
    async disponible() {
      try {
        return !!(window.PublicKeyCredential && window.isSecureContext && location.hostname &&
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
      } catch { return false; }
    },
    async registrar() {
      const u = LC.usuario();
      if (!u) return { ok: false, msg: 'Ingresa a tu cuenta para registrar tu huella o rostro.' };
      if (!(await this.disponible())) {
        const ok = await this.simular('Registrar huella o rostro');
        if (!ok) return { ok: false, msg: 'Registro cancelado.' };
        LC.actualizarUsuario({ passkey: { id: null, simulada: true, fecha: new Date().toISOString() } });
        return { ok: true, msg: 'Registro simulado listo. Con HTTPS se usa el sensor real del dispositivo.' };
      }
      try {
        const cred = await navigator.credentials.create({ publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: 'Librería Calama' },
          user: { id: new TextEncoder().encode(u.uid || LC.uid()), name: u.email, displayName: u.nombre },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
          timeout: 60000,
        } });
        LC.actualizarUsuario({ passkey: { id: aB64(cred.rawId), fecha: new Date().toISOString() } });
        return { ok: true, msg: 'Huella o rostro registrado en este dispositivo.' };
      } catch (e) {
        return { ok: false, msg: e.name === 'NotAllowedError' ? 'Se canceló la verificación.' : 'No se pudo registrar: ' + e.message };
      }
    },
    async confirmar(monto) {
      const u = LC.usuario();
      const real = await this.disponible();
      if (real && u && u.passkey && u.passkey.id) {
        try {
          await navigator.credentials.get({ publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [{ type: 'public-key', id: deB64(u.passkey.id) }],
            userVerification: 'required', timeout: 60000,
          } });
          return { ok: true, metodo: 'webauthn' };
        } catch (e) {
          return { ok: false, msg: e.name === 'NotAllowedError' ? 'Se canceló la verificación.' : 'No se pudo verificar: ' + e.message };
        }
      }
      if (real && u && !(u.passkey && u.passkey.id)) {
        const r = await this.registrar();
        return r.ok ? { ok: true, metodo: 'webauthn' } : r;
      }
      const ok = await this.simular(`Confirmar pago de ${clp(monto)}`);
      return ok ? { ok: true, metodo: 'simulado' } : { ok: false, msg: 'Pago no confirmado.' };
    },
    simular(titulo) {
      return new Promise(resolve => {
        let resuelto = false;
        const fin = v => { if (!resuelto) { resuelto = true; resolve(v); } };
        LC.modal(titulo, `<div class="biometria">
            <div class="biometria__sensor">${icono('huella')}</div>
            <p>Toca el sensor de huella o mira la cámara de tu dispositivo.</p>
            <p class="tenue chico">Demostración: aquí el sensor se simula. Con el sitio publicado en HTTPS, el navegador usa el sensor real (Windows Hello, Touch ID, Face ID o la huella de Android).</p>
            <div class="fila-botones"><button class="btn" data-b="0">Cancelar</button><button class="btn btn--primario" data-b="1">Simular verificación</button></div>
          </div>`, d => {
          $$('[data-b]', d).forEach(b => b.addEventListener('click', () => {
            if (b.dataset.b === '1') {
              $('.biometria__sensor', d).classList.add('ok');
              setTimeout(() => { LC.cerrarModal(); fin(true); }, 700);
            } else { LC.cerrarModal(); fin(false); }
          }));
          d.addEventListener('close', () => fin(false), { once: true });
        });
      });
    },
  };

  /* ---------- Lectura en voz alta de la página ---------- */
  LC.leerPagina = () => {
    if (!LC.puedeHablar) { LC.toast('Tu navegador no permite leer en voz alta.', 'error'); return; }
    if (speechSynthesis.speaking) { LC.callar(); LC.toast('Lectura detenida.'); return; }
    const partes = $('#contenido').innerText.split(/\n+/).map(s => s.trim()).filter(s => s.length > 1);
    speechSynthesis.cancel();
    partes.forEach((p, i) => { if (i === 0) LC.hablar(p); else { const u = new SpeechSynthesisUtterance(p); u.lang = 'es-CL'; u.rate = LC.prefs().velocidadVoz; const v = speechSynthesis.getVoices().find(x => x.lang.startsWith('es')); if (v) u.voice = v; speechSynthesis.speak(u); } });
    LC.toast('Leyendo la página. Pulsa de nuevo «Escuchar» o di «detener» para parar.');
  };
  A['leer-pagina'] = () => LC.leerPagina();
  A.escuchar = b => LC.hablar(b.dataset.texto);

  /* ---------- 6 y 7. Colores, letra y accesibilidad ---------- */
  const ACENTOS = [['#0E5B50', 'Atacamita'], ['#23468C', 'Lapislázuli'], ['#9C4A1C', 'Cobre'], ['#9B2A6B', 'Flor del desierto'], ['#2D3436', 'Basalto']];
  LC.controlesA11y = pre => {
    const p = LC.prefs();
    const esPropio = !ACENTOS.some(([c]) => c.toLowerCase() === p.acento.toLowerCase());
    return `<form class="controles-a11y" data-a11y onsubmit="return false">
      <fieldset class="campo"><legend>Tema</legend><div class="segmentado">
        ${[['claro', 'Claro'], ['oscuro', 'Oscuro'], ['contraste', 'Alto contraste']].map(([v, t]) => `<label><input type="radio" name="tema" value="${v}" ${p.tema === v ? 'checked' : ''}><span>${t}</span></label>`).join('')}
      </div></fieldset>
      <fieldset class="campo"><legend>Color principal</legend><div class="muestras">
        ${ACENTOS.map(([c, n]) => `<label class="muestra" title="${n}"><input type="radio" name="acento" value="${c}" ${p.acento.toLowerCase() === c.toLowerCase() ? 'checked' : ''}><span style="--m:${c}"></span><span class="sr">${n}</span></label>`).join('')}
        <label class="muestra muestra--propia"><input type="radio" name="acento" value="propio" ${esPropio ? 'checked' : ''}><input type="color" name="acentoPropio" value="${esPropio ? p.acento : '#7A3B1E'}" aria-label="Elegir otro color"></label>
      </div><small class="tenue">Si el color elegido tiene poco contraste, lo ajustamos para que se lea bien.</small></fieldset>
      <div class="campo"><label for="${pre}-escala">Tamaño de letra: <output id="${pre}-escala-out">${p.escala} %</output></label>
        <input type="range" id="${pre}-escala" name="escala" min="90" max="160" step="10" value="${p.escala}"></div>
      <div class="campo"><label for="${pre}-voz">Velocidad de lectura en voz alta: <output id="${pre}-voz-out">${p.velocidadVoz}×</output></label>
        <input type="range" id="${pre}-voz" name="velocidadVoz" min="0.6" max="1.6" step="0.1" value="${p.velocidadVoz}"></div>
      <label class="opcion-simple"><input type="checkbox" name="interlineado" ${p.interlineado === 'amplio' ? 'checked' : ''}> Más espacio entre líneas</label>
      <label class="opcion-simple"><input type="checkbox" name="dislexia" ${p.dislexia ? 'checked' : ''}> Letra para dislexia</label>
      <label class="opcion-simple"><input type="checkbox" name="subrayado" ${p.subrayado ? 'checked' : ''}> Subrayar todos los enlaces</label>
      <label class="opcion-simple"><input type="checkbox" name="movimiento" ${p.movimiento ? 'checked' : ''}> Reducir animaciones</label>
      <button type="button" class="btn btn--chico" data-a11y-reset>Volver a los valores iniciales</button>
    </form>`;
  };
  LC.enlazarA11y = raiz => {
    const form = $('[data-a11y]', raiz);
    if (!form) return;
    const leerForm = () => {
      const fd = new FormData(form);
      const acento = fd.get('acento') === 'propio' ? fd.get('acentoPropio') : fd.get('acento');
      LC.guardar('prefs', { tema: fd.get('tema'), acento, escala: +fd.get('escala'), velocidadVoz: +fd.get('velocidadVoz'), interlineado: fd.has('interlineado') ? 'amplio' : 'normal', dislexia: fd.has('dislexia'), subrayado: fd.has('subrayado'), movimiento: fd.has('movimiento') });
      LC.aplicarPrefs();
      $$('output', form).forEach(o => { const i = $('#' + o.id.replace('-out', ''), form); if (i) o.textContent = i.name === 'escala' ? i.value + ' %' : i.value + '×'; });
      sincronizarOtros(form);
    };
    form.addEventListener('input', e => { if (e.target.name === 'acentoPropio') $('[name="acento"][value="propio"]', form).checked = true; leerForm(); });
    form.addEventListener('change', leerForm);
    $('[data-a11y-reset]', form).addEventListener('click', () => {
      LC.guardar('prefs', {});
      LC.aplicarPrefs();
      const nuevo = document.createElement('div');
      nuevo.innerHTML = LC.controlesA11y($('input[type="range"]', form).id.split('-')[0]);
      form.replaceWith(nuevo.firstElementChild);
      LC.enlazarA11y(raiz);
      sincronizarOtros(null);
      LC.toast('Apariencia restablecida.');
    });
  };
  /* Si el panel y la página de accesibilidad están abiertos a la vez, se mantienen iguales */
  const sincronizarOtros = origen => {
    $$('[data-a11y]').forEach(f => {
      if (f === origen) return;
      const contenedor = f.parentElement;
      const pre = f.querySelector('input[type="range"]').id.split('-')[0];
      const nuevo = document.createElement('div');
      nuevo.innerHTML = LC.controlesA11y(pre);
      f.replaceWith(nuevo.firstElementChild);
      LC.enlazarA11y(contenedor);
    });
  };

  LC.alternarPanelA11y = forzar => {
    const panel = $('#panel-a11y'), btn = $('[data-action="panel-a11y"].cabecera__btn');
    const abrir = forzar ?? panel.hidden;
    if (abrir) {
      $('#panel-a11y-cuerpo').innerHTML = LC.controlesA11y('pn');
      LC.enlazarA11y($('#panel-a11y-cuerpo'));
    }
    panel.hidden = !abrir;
    if (btn) btn.setAttribute('aria-expanded', abrir);
    if (abrir) $('#panel-a11y h2').focus(); else if (btn) btn.focus();
  };
  A['panel-a11y'] = () => LC.alternarPanelA11y();

  LC.cambiarPref = cambios => { LC.guardar('prefs', { ...LC.prefs(), ...cambios }); LC.aplicarPrefs(); sincronizarOtros(null); };

  /* ---------- 4. Navegación por voz (Web Speech API) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, vozActiva = false;
  const barra = () => $('#voz-barra');
  const mostrarVoz = (estado, texto = '', resultado = '') => {
    const b = barra();
    b.hidden = false;
    $('#voz-estado').textContent = estado;
    $('#voz-texto').textContent = texto ? `«${texto}»` : '';
    $('#voz-resultado').textContent = resultado;
  };
  const marcarBoton = () => $$('[data-action="voz"].cabecera__btn').forEach(b => { b.setAttribute('aria-pressed', vozActiva); b.classList.toggle('activo', vozActiva); });

  LC.alternarVoz = () => {
    if (!SR) {
      mostrarVoz('Tu navegador no reconoce voz. Prueba con Chrome o Edge, o escribe el comando aquí:');
      $('#voz-form').hidden = false;
      $('#voz-input').focus();
      return;
    }
    if (vozActiva) { vozActiva = false; rec && rec.stop(); marcarBoton(); barra().hidden = true; LC.toast('Navegación por voz desactivada.'); return; }
    rec = new SR();
    rec.lang = 'es-CL';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = e => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.trim();
        if (e.results[i].isFinal) mostrarVoz('Escuchando. Di «ayuda» para ver los comandos.', t, LC.ejecutarComando(t));
        else mostrarVoz('Escuchando…', t);
      }
    };
    rec.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        vozActiva = false; marcarBoton();
        mostrarVoz('No hay permiso para usar el micrófono. Actívalo desde el candado de la barra de direcciones, o escribe el comando:');
        $('#voz-form').hidden = false;
      } else if (e.error === 'network') {
        mostrarVoz('El reconocimiento de voz necesita conexión a internet. Puedes escribir el comando:');
        $('#voz-form').hidden = false;
      }
    };
    rec.onend = () => { if (vozActiva) { try { rec.start(); } catch { /* ya iniciado */ } } };
    try {
      rec.start();
      vozActiva = true;
      marcarBoton();
      mostrarVoz('Escuchando. Di por ejemplo «ir a ofertas» o «buscar Neruda».');
    } catch (e) { LC.toast('No se pudo iniciar el micrófono.', 'error'); }
  };
  A.voz = () => LC.alternarVoz();

  const RUTAS_VOZ = {
    inicio: '#/', portada: '#/', catalogo: '#/catalogo', libros: '#/catalogo', categorias: '#/categorias', carrito: '#/carrito', pago: '#/pago', pagar: '#/pago',
    ofertas: '#/ofertas', descuentos: '#/ofertas', cupones: '#/ofertas', 'ediciones limitadas': '#/limitadas', limitadas: '#/limitadas', biblioteca: '#/biblioteca',
    club: '#/club', 'club de lectura': '#/club', idiomas: '#/idiomas', ingles: '#/idiomas', nosotros: '#/nosotros', 'sobre nosotros': '#/nosotros',
    cuenta: '#/cuenta', perfil: '#/cuenta', pedidos: '#/pedidos', seguimiento: '#/pedidos', notificaciones: '#/notificaciones', avisos: '#/notificaciones',
    administracion: '#/admin', admin: '#/admin', accesibilidad: '#/accesibilidad', modulos: '#/modulos', personalizar: '#/personalizar', regalo: '#/personalizar',
  };
  LC.ejecutarComando = texto => {
    const t = LC.normalizar(texto).replace(/[.,;:!?¿¡«»"]/g, '').replace(/\s+/g, ' ').trim();
    let m;
    if (/^(ayuda|que puedo decir|comandos)/.test(t)) { location.hash = '#/accesibilidad'; return 'Abriendo la lista de comandos.'; }
    if (/(desactivar|apagar|detener) (la )?voz|dejar de escuchar/.test(t)) { if (vozActiva) LC.alternarVoz(); return 'Voz desactivada.'; }
    if ((m = t.match(/^(?:buscar|busca|busco|buscame)\s+(.+)$/))) { location.hash = '#/catalogo?q=' + encodeURIComponent(m[1]); return `Buscando «${m[1]}».`; }
    if (/^(bajar|baja|abajo|siguiente)$/.test(t)) { scrollBy({ top: innerHeight * 0.7, behavior: 'smooth' }); return 'Bajando.'; }
    if (/^(subir|sube|arriba)$/.test(t)) { scrollBy({ top: -innerHeight * 0.7, behavior: 'smooth' }); return 'Subiendo.'; }
    if (/^(volver|atras|regresar)$/.test(t)) { history.back(); return 'Volviendo.'; }
    if (/(leer|lee|leeme) (la |esta )?pagina|leer en voz alta/.test(t)) { LC.leerPagina(); return 'Leyendo la página.'; }
    if (/^(detener|para|parar|silencio|callate|basta)$/.test(t)) { LC.callar(); return 'Lectura detenida.'; }
    if (/(modo|tema) oscuro/.test(t)) { LC.cambiarPref({ tema: 'oscuro' }); return 'Tema oscuro activado.'; }
    if (/(modo|tema) claro/.test(t)) { LC.cambiarPref({ tema: 'claro' }); return 'Tema claro activado.'; }
    if (/alto contraste/.test(t)) { LC.cambiarPref({ tema: 'contraste' }); return 'Alto contraste activado.'; }
    if (/(agrandar|aumentar|mas grande).*(letra|texto)|letra mas grande/.test(t)) { const e = Math.min(160, LC.prefs().escala + 10); LC.cambiarPref({ escala: e }); return `Letra al ${e} %.`; }
    if (/(achicar|reducir|disminuir|mas chica|mas pequena).*(letra|texto)|letra mas (chica|pequena)/.test(t)) { const e = Math.max(90, LC.prefs().escala - 10); LC.cambiarPref({ escala: e }); return `Letra al ${e} %.`; }
    if (/(agregar|anadir|poner).*(carrito)|^comprar(lo)?$/.test(t)) {
      const f = $('#form-compra');
      if (f) { f.requestSubmit(); return 'Agregando al carrito.'; }
      return 'Primero abre la ficha de un libro.';
    }
    if (/asistente/.test(t)) { LC.alternarAsistente(true); return 'Abriendo el asistente.'; }
    if (/(senas|interprete|lsch)/.test(t)) { LC.alternarLsch(true); return 'Abriendo el intérprete de lengua de señas.'; }
    if (/(colores|apariencia|tamano de letra)/.test(t)) { LC.alternarPanelA11y(true); return 'Abriendo colores y letra.'; }
    if ((m = t.match(/^(?:ir a|ir al|anda a|abrir|abre|ver|ve a|mostrar|muestrame|llevame a)\s+(?:la |el |los |las |mi |mis |al |a )?(.+)$/))) {
      const destino = m[1].trim();
      const ruta = RUTAS_VOZ[destino] || Object.entries(RUTAS_VOZ).find(([k]) => destino.includes(k))?.[1];
      if (ruta) { location.hash = ruta; return `Abriendo ${destino}.`; }
      const libro = LC.catalogo().find(l => LC.normalizar(l.titulo).includes(destino) || destino.includes(LC.normalizar(l.titulo)));
      if (libro) { location.hash = '#/libro/' + libro.id; return `Abriendo «${libro.titulo}».`; }
      return `No encontré «${destino}». Prueba con «buscar ${destino}».`;
    }
    const directo = RUTAS_VOZ[t];
    if (directo) { location.hash = directo; return `Abriendo ${t}.`; }
    return `No entendí «${texto}». Di «ayuda» para ver los comandos.`;
  };

  /* ---------- 5. Asistente virtual ---------- */
  const historial = [];
  LC.alternarAsistente = forzar => {
    const panel = $('#asistente'), boton = $('.flotante--asistente');
    const abrir = forzar ?? panel.hidden;
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', abrir);
    if (abrir) {
      if (!historial.length) responder(null);
      $('#asistente-input').focus();
    } else boton.focus();
  };
  A.asistente = () => LC.alternarAsistente();

  const pintarMensajes = () => {
    $('#asistente-mensajes').innerHTML = historial.map(m => `<li class="msg msg--${m.de}">
      <p>${m.html}</p>
      ${m.libros && m.libros.length ? `<ul class="msg__libros">${m.libros.map(l => `<li><a href="#/libro/${l.id}">${esc(l.titulo)}</a> <span class="tenue">${esc(l.autor)}, ${LC.precio(l) ? clp(LC.precio(l)) : 'gratis'}</span>
        <button class="btn btn--chico" data-action="agregar" data-id="${l.id}" data-formato="${l.stock > 0 ? 'impreso' : 'digital'}" ${l.stock <= 0 && !l.formatos.includes('digital') ? 'disabled' : ''}>Agregar</button></li>`).join('')}</ul>` : ''}
      ${m.enlaces ? `<p class="msg__enlaces">${m.enlaces.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</p>` : ''}
    </li>`).join('');
    const lista = $('#asistente-mensajes');
    lista.scrollTop = lista.scrollHeight;
  };

  const CAT_CLAVES = { poesia: /poes|poema|verso/, chilena: /chilen|chile|mistral|neruda/, infantil: /nin|infantil|hij|juvenil|chic/, ciencia: /cienc|astro|estrell|cielo|univers|espacio/, novela: /novela/, clasicos: /clasic/, idiomas: /ingles|idioma|english/ };

  /* Respuestas locales: reglas sobre el catálogo real de la tienda */
  const respuestaLocal = pregunta => {
    const q = LC.normalizar(pregunta);
    const libros = LC.catalogo();
    const disp = ls => ls.filter(l => l.stock > 0 || l.formatos.includes('digital'));
    if (/^(hola|buen[oa]s|hey|saludos)/.test(q)) return { html: '¡Hola! Puedo recomendarte libros, decirte precios, explicarte el despacho o ayudarte con tu pedido.' };
    if (/despach|envio|enviar|llega|retir/.test(q)) return { html: `Puedes retirar gratis en la tienda de Calama. El despacho dentro de Calama cuesta ${clp(LC.CONFIG.envio.calama)} (24 a 48 horas) y al resto de Chile ${clp(LC.CONFIG.envio.chile)} (3 a 6 días hábiles). Desde ${clp(LC.CONFIG.envio.gratisDesde)} el despacho es gratis.` };
    if (/pedido|seguim|donde esta mi|estado de mi/.test(q)) {
      const p = LC.pedidos()[0];
      return p ? { html: `Tu último pedido, ${p.id}, está en la etapa «${LC.estadosDe(p)[p.estado]}».`, enlaces: [['Ver el pedido', '#/pedido/' + p.id]] } : { html: 'No veo pedidos en esta cuenta. Cuando compres, podrás seguirlos en Mis pedidos.', enlaces: [['Ir a Mis pedidos', '#/pedidos']] };
    }
    if (/cupon|descuento|oferta|rebaja|barato/.test(q) && !/menos de|bajo \$|hasta/.test(q)) {
      const cs = LC.cupones();
      return { html: `Hay ${cs.length} cupones vigentes: ${cs.map(c => `<strong>${esc(c.codigo)}</strong> (${esc(c.desc.toLowerCase())})`).join(', ')} Estos libros están rebajados:`, libros: libros.filter(l => l.oferta > 0).slice(0, 4) };
    }
    if (/horario|direcc|donde (estan|queda)|telefono|contacto|ubicac/.test(q)) return { html: `Estamos en ${esc(LC.TIENDA.ciudad)}. Dirección: ${esc(LC.TIENDA.direccion)}. Horario: ${esc(LC.TIENDA.horario)}.`, enlaces: [['Ver Sobre nosotros', '#/nosotros']] };
    if (/club|lectura grupal|videollam|grupo/.test(q)) return { html: `Tenemos ${LC.CLUBES.length} clubes: ${LC.CLUBES.map(c => `${c.nombre} (${c.cuando.toLowerCase()})`).join(', ')}. Puedes ir a la tienda o conectarte por videollamada.`, enlaces: [['Ver clubes', '#/club']] };
    if (/accesib|voz|senas|ciego|baja vision|dislex|contraste/.test(q)) return { html: 'El sitio tiene navegación por voz, lectura en voz alta, videos en lengua de señas chilena, letra ajustable, letra para dislexia y alto contraste.', enlaces: [['Ver accesibilidad', '#/accesibilidad']] };
    if (/regalo|dedicat|ex ?libris|envolt/.test(q)) return { html: 'Puedes personalizar cualquier libro impreso con dedicatoria escrita a mano, ex libris y envoltura de regalo. Te propongo dedicatorias si me cuentas la ocasión.', enlaces: [['Personalizar un regalo', '#/personalizar']] };
    if (/limitad|numerad|coleccion/.test(q)) return { html: 'Estas son nuestras ediciones limitadas, numeradas y de un ejemplar por persona:', libros: libros.filter(l => l.limitada) };
    if (/digital|ebook|gratis|dominio publico/.test(q)) return { html: 'Estos libros se pueden leer en digital:', libros: libros.filter(l => l.formatos.includes('digital')).slice(0, 5), enlaces: [['Ir a mi biblioteca', '#/biblioteca']] };

    const max = q.match(/(?:menos de|bajo|hasta|maximo)\s*\$?\s*([\d.]+)/);
    const tope = max ? parseInt(max[1].replace(/\./g, ''), 10) : null;
    const cat = Object.entries(CAT_CLAVES).find(([, re]) => re.test(q));
    if (/recomien|suger|que (me )?(lee|leo|compr)|busco algo|regal/.test(q) || cat || tope) {
      let ls = disp(libros);
      if (cat) ls = ls.filter(l => l.cat === cat[0]);
      if (tope) ls = ls.filter(l => LC.precio(l) <= tope);
      const u = LC.usuario();
      if (!cat && u && u.generos && u.generos.length) ls.sort((a, b) => (u.generos.includes(b.cat) ? 1 : 0) - (u.generos.includes(a.cat) ? 1 : 0));
      if (!ls.length) return { html: `No encontré libros${cat ? ' de ' + LC.categoria(cat[0]).nombre.toLowerCase() : ''}${tope ? ' por menos de ' + clp(tope) : ''}. Prueba con otro presupuesto o categoría.` };
      return { html: `Te recomiendo${cat ? ` en ${LC.categoria(cat[0]).nombre.toLowerCase()}` : ''}${tope ? ` por hasta ${clp(tope)}` : ''}:`, libros: ls.slice(0, 4) };
    }
    const palabras = q.split(/\s+/).filter(w => w.length > 3 && !/cuanto|cuesta|precio|tienen|tienes|libro|libros|quiero|busco|sobre/.test(w));
    const encontrados = libros.filter(l => palabras.some(w => LC.normalizar(l.titulo + ' ' + l.autor).includes(w)));
    if (encontrados.length) return { html: encontrados.length === 1 ? `Sí, tenemos «${esc(encontrados[0].titulo)}»${encontrados[0].stock > 0 ? `, con ${encontrados[0].stock} ejemplares disponibles` : ', aunque el impreso está agotado'}.` : 'Encontré estos libros:', libros: encontrados.slice(0, 4) };
    return { html: 'No encontré una respuesta para eso. Puedo recomendarte libros (por ejemplo «poesía por menos de $10.000»), contarte sobre despachos, cupones, pedidos o el club de lectura.', enlaces: [['Buscar en el catálogo', '#/catalogo?q=' + encodeURIComponent(pregunta)]] };
  };

  const responder = async pregunta => {
    if (pregunta === null) {
      historial.push({ de: 'bot', html: 'Hola, soy el asistente de Librería Calama. ¿Qué te gustaría leer?' });
      pintarMensajes();
      return;
    }
    historial.push({ de: 'yo', html: esc(pregunta) });
    historial.push({ de: 'bot', html: '<span class="escribiendo" aria-label="Escribiendo">…</span>' });
    pintarMensajes();
    const remota = await LC.ia.pedir('asistente', { pregunta, historial: historial.slice(-8).map(m => ({ de: m.de, texto: m.html.replace(/<[^>]+>/g, '') })), catalogo: LC.catalogo().map(l => ({ id: l.id, titulo: l.titulo, autor: l.autor, precio: LC.precio(l), stock: l.stock })) });
    if (!remota) await new Promise(r => setTimeout(r, 350));
    historial[historial.length - 1] = remota ? { de: 'bot', html: esc(remota) } : { de: 'bot', ...respuestaLocal(pregunta) };
    pintarMensajes();
  };

  /* ---------- 8. Intérprete de lengua de señas chilena (reformulado) ----------
     En lugar de traducir automáticamente, cada sección tiene un video grabado por intérpretes
     en videos/lsch/<seccion>.mp4. Si falta el video, se indica que está en grabación. */
  const NOMBRES_SECCION = { inicio: 'Inicio', catalogo: 'Catálogo', categorias: 'Categorías', categoria: 'Categoría', libro: 'Ficha del libro', carrito: 'Carrito', pago: 'Pago', pedidos: 'Seguimiento de pedidos', pedido: 'Detalle del pedido', ofertas: 'Ofertas', limitadas: 'Ediciones limitadas', personalizar: 'Personalizar regalo', biblioteca: 'Biblioteca digital', leer: 'Lector digital', club: 'Club de lectura', sala: 'Sala del club', idiomas: 'Idiomas', nosotros: 'Sobre nosotros', admin: 'Administración', cuenta: 'Mi cuenta', notificaciones: 'Notificaciones', modulos: 'Módulos', accesibilidad: 'Accesibilidad', noEncontrado: 'Página no encontrada' };
  const actualizarLsch = () => {
    const panel = $('#lsch');
    if (panel.hidden) return;
    const seccion = LC.rutaNombre || 'inicio';
    $('#lsch-seccion').textContent = `Sección: ${NOMBRES_SECCION[seccion] || seccion}`;
    const zona = $('#lsch-video');
    zona.innerHTML = `<video controls playsinline preload="metadata" aria-label="Video en lengua de señas chilena de la sección ${NOMBRES_SECCION[seccion] || seccion}"><source src="videos/lsch/${seccion}.mp4" type="video/mp4"></video>`;
    const video = $('video', zona);
    const faltante = () => {
      zona.innerHTML = `<div class="lsch__pendiente">${icono('mano')}<p>El video en LSCh de esta sección está en grabación.</p><p class="tenue chico">Se publica en videos/lsch/${seccion}.mp4, grabado por un intérprete certificado.</p></div>`;
    };
    $('source', video).addEventListener('error', faltante);
    video.addEventListener('error', faltante);
  };
  LC.alternarLsch = forzar => {
    const panel = $('#lsch'), boton = $('.flotante--lsch');
    const abrir = forzar ?? panel.hidden;
    panel.hidden = !abrir;
    boton.setAttribute('aria-expanded', abrir);
    if (abrir) { actualizarLsch(); $('#lsch h2').focus(); } else boton.focus();
  };
  A.lsch = () => LC.alternarLsch();
  A['lsch-tamano'] = b => { const p = $('#lsch'); const grande = p.classList.toggle('lsch--grande'); b.setAttribute('aria-pressed', grande); };

  LC.on('ruta', actualizarLsch);

  /* Enlaces de eventos de los paneles flotantes (se llama una vez al iniciar) */
  LC.iniciarPaneles = () => {
    $('#asistente-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#asistente-input');
      const t = input.value.trim();
      if (!t) return;
      input.value = '';
      responder(t);
    });
    $('#asistente-sugerencias').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) responder(b.textContent);
    });
    $('#voz-form').addEventListener('submit', e => {
      e.preventDefault();
      const t = $('#voz-input').value.trim();
      if (!t) return;
      mostrarVoz('Comando escrito.', t, LC.ejecutarComando(t));
      $('#voz-input').value = '';
    });
    $('#voz-cerrar').addEventListener('click', () => { if (vozActiva) LC.alternarVoz(); barra().hidden = true; $('#voz-form').hidden = true; });
  };
})();
