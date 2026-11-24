/* Enrutador por hash, acciones globales, contadores de la cabecera e inicio de la aplicación. */
(function () {
  const LC = window.LC;
  const { $, $$ } = LC;
  const V = LC.vistas, A = LC.acciones;

  const RUTAS = [
    [/^$/, 'inicio'], [/^catalogo$/, 'catalogo'], [/^categorias$/, 'categorias'], [/^categoria\/([\w-]+)$/, 'categoria'],
    [/^libro\/([\w-]+)$/, 'libro'], [/^carrito$/, 'carrito'], [/^pago$/, 'pago'], [/^pedidos$/, 'pedidos'], [/^pedido\/([\w-]+)$/, 'pedido'],
    [/^ofertas$/, 'ofertas'], [/^limitadas$/, 'limitadas'], [/^personalizar$/, 'personalizar'], [/^biblioteca$/, 'biblioteca'],
    [/^leer\/([\w-]+)$/, 'leer'], [/^club$/, 'club'], [/^club\/([\w-]+)$/, 'sala'], [/^idiomas$/, 'idiomas'], [/^nosotros$/, 'nosotros'],
    [/^admin$/, 'admin'], [/^cuenta$/, 'cuenta'], [/^notificaciones$/, 'notificaciones'], [/^modulos$/, 'modulos'], [/^accesibilidad$/, 'accesibilidad'],
  ];
  /* Sección del menú que se marca como actual para cada vista */
  const MENU = { categoria: 'catalogo', libro: 'catalogo', categorias: 'catalogo', pedido: 'cuenta', pedidos: 'cuenta', sala: 'club', leer: 'biblioteca', pago: 'carrito', personalizar: 'ofertas' };

  let salidas = [];
  LC.alSalir = fn => salidas.push(fn);

  const rutaActual = () => {
    const h = location.hash.replace(/^#\/?/, '');
    const [ruta, qs] = h.split('?');
    return { ruta: ruta.replace(/\/$/, ''), query: Object.fromEntries(new URLSearchParams(qs || '')) };
  };

  LC.navegar = (enfocar = true) => {
    if (location.hash && !location.hash.startsWith('#/')) return;
    salidas.forEach(fn => { try { fn(); } catch { /* sin efectos */ } });
    salidas = [];
    LC.callar();
    const { ruta, query } = rutaActual();
    let vista = 'noEncontrado', params = [];
    for (const [re, nombre] of RUTAS) {
      const m = ruta.match(re);
      if (m) { vista = nombre; params = m.slice(1); break; }
    }
    LC.rutaNombre = vista;
    document.body.dataset.vista = vista;
    try { V[vista](params, query); } catch (err) { console.error(err); V.noEncontrado(); }
    const seccion = MENU[vista] || vista;
    $$('.nav a').forEach(a => {
      const destino = a.getAttribute('href').replace(/^#\/?/, '') || 'inicio';
      if (destino === seccion) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (enfocar) {
      window.scrollTo(0, 0);
      const h1 = $('#contenido h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
    LC.emit('ruta', vista);
  };

  /* Vuelve a pintar la vista actual sin mover el foco ni el scroll */
  LC.refrescar = () => {
    const y = window.scrollY;
    const activo = document.activeElement && document.activeElement.id;
    LC.navegar(false);
    window.scrollTo(0, y);
    if (activo && document.getElementById(activo)) document.getElementById(activo).focus({ preventScroll: true });
  };

  /* ---------- Acciones globales ---------- */
  A.agregar = b => {
    const r = LC.agregarAlCarrito(b.dataset.id, b.dataset.formato || 'impreso');
    LC.toast(r.msg, r.ok ? 'ok' : 'error');
  };
  A.favorito = b => {
    const ahora = LC.alternarFavorito(b.dataset.id);
    LC.toast(ahora ? 'Guardado en favoritos.' : 'Quitado de favoritos.');
    LC.refrescar();
    const nuevo = $(`[data-action="favorito"][data-id="${b.dataset.id}"]`);
    if (nuevo) nuevo.focus();
  };
  A['cerrar-modal'] = () => LC.cerrarModal();

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if (!b || b.disabled) return;
    const fn = A[b.dataset.action];
    if (fn) { e.preventDefault(); fn(b, e); }
  });

  /* ---------- Cabecera: contadores ---------- */
  const actualizarContadores = () => {
    const n = LC.totales().cantidad;
    const c = $('#cont-carrito');
    c.textContent = n || '';
    c.hidden = !n;
    $('#btn-carrito').setAttribute('aria-label', n ? `Carrito, ${LC.plural(n, 'libro', 'libros')}` : 'Carrito vacío');
    const sinLeer = LC.notificaciones().filter(x => !x.leida).length;
    const cn = $('#cont-notif');
    cn.textContent = sinLeer || '';
    cn.hidden = !sinLeer;
    $('#btn-notif').setAttribute('aria-label', sinLeer ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones');
    const u = LC.usuario();
    $('#btn-cuenta').setAttribute('aria-label', u ? `Mi cuenta, ${u.nombre}` : 'Ingresar o crear cuenta');
  };
  LC.on('cambio', clave => {
    if (['carrito', 'notifs', 'usuario', 'libros'].includes(clave)) actualizarContadores();
  });
  LC.on('cambio:pedidos', () => { if (['pedido', 'pedidos'].includes(LC.rutaNombre)) LC.refrescar(); });
  LC.on('cambio:notifs', () => { if (LC.rutaNombre === 'notificaciones') LC.refrescar(); });

  /* ---------- Atajos de teclado ---------- */
  document.addEventListener('keydown', e => {
    const escribiendo = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if (e.key === '/' && !escribiendo) { e.preventDefault(); $('#buscar').focus(); }
    if (e.altKey && (e.key === 'v' || e.key === 'V')) { e.preventDefault(); LC.alternarVoz(); }
    if (e.altKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); LC.alternarPanelA11y(); }
    if (e.key === 'Escape') {
      if (!$('#panel-a11y').hidden) LC.alternarPanelA11y(false);
      else if (!$('#asistente').hidden) LC.alternarAsistente(false);
      else if (!$('#lsch').hidden) LC.alternarLsch(false);
      else if (!$('#voz-barra').hidden) $('#voz-cerrar').click();
      const menu = $('#menu-seleccion'); if (menu) menu.hidden = true;
      const pop = $('#popover'); if (pop) pop.hidden = true;
    }
  });

  /* ---------- Inicio ---------- */
  const iniciar = () => {
    LC.aplicarPrefs();
    LC.iniciarPaneles();

    $('#form-buscar').addEventListener('submit', e => {
      e.preventDefault();
      const q = $('#buscar').value.trim();
      location.hash = '#/catalogo' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
    $('.saltar').addEventListener('click', e => { e.preventDefault(); const h1 = $('#contenido h1') || $('#contenido'); h1.focus(); });
    $('#anio').textContent = new Date().getFullYear();

    if (!LC.leer('bienvenida', false)) {
      LC.guardar('bienvenida', true);
      LC.notificar('sistema', 'Te damos la bienvenida', 'Usa el cupón CALAMA10 para tener 10 % de descuento en tu primera compra.', '#/ofertas');
    }

    LC.avanzarPedidosDemo();
    setInterval(LC.avanzarPedidosDemo, 15000);

    window.addEventListener('hashchange', () => LC.navegar(true));
    actualizarContadores();
    LC.navegar(false);
    /* Con algunas voces del sistema, la lista llega después de cargar la página */
    if (LC.puedeHablar) speechSynthesis.getVoices();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
