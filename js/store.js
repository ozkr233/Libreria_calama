/* Estado persistente (localStorage) y reglas de negocio: catálogo, carrito, cupones, pedidos y avisos. */
(function () {
  const LC = window.LC;
  const PREFIJO = 'lc:';
  const oyentes = {};

  LC.on = (evento, fn) => { (oyentes[evento] = oyentes[evento] || []).push(fn); };
  LC.emit = (evento, dato) => (oyentes[evento] || []).forEach(fn => fn(dato));

  LC.leer = (clave, porDefecto) => {
    try {
      const v = localStorage.getItem(PREFIJO + clave);
      return v === null ? porDefecto : JSON.parse(v);
    } catch { return porDefecto; }
  };
  LC.guardar = (clave, valor) => {
    try { localStorage.setItem(PREFIJO + clave, JSON.stringify(valor)); } catch { /* almacenamiento lleno o bloqueado */ }
    LC.emit('cambio', clave);
    LC.emit('cambio:' + clave, valor);
  };
  LC.restablecerTodo = () => {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIJO)).forEach(k => localStorage.removeItem(k));
  };

  /* ---------- Catálogo ---------- */
  LC.catalogo = () => LC.leer('libros', null) || LC.LIBROS_BASE;
  LC.libro = id => LC.catalogo().find(l => l.id === id);
  LC.guardarCatalogo = libros => LC.guardar('libros', libros);
  LC.categoria = id => LC.CATEGORIAS.find(c => c.id === id);

  const redondear = n => Math.round(n / 10) * 10;
  LC.precioBase = (l, formato = 'impreso') => formato === 'digital' ? (l.precioDigital ?? l.precio) : l.precio;
  LC.precio = (l, formato = 'impreso') => redondear(LC.precioBase(l, formato) * (1 - (l.oferta || 0) / 100));

  /* ---------- Cupones ---------- */
  LC.cupones = () => LC.leer('cupones', null) || LC.CUPONES_BASE;

  /* ---------- Carrito ---------- */
  LC.carrito = () => LC.leer('carrito', []);
  LC.agregarAlCarrito = (id, formato = 'impreso', cantidad = 1, perso = null) => {
    const l = LC.libro(id);
    if (!l) return { ok: false, msg: 'Ese libro ya no está en el catálogo.' };
    if (!l.formatos.includes(formato)) formato = l.formatos[0];
    const carro = LC.carrito();
    const enCarro = carro.filter(i => i.id === id && i.formato === 'impreso').reduce((s, i) => s + i.qty, 0);
    if (formato === 'impreso' && enCarro + cantidad > l.stock) {
      return { ok: false, msg: l.stock === 0 ? 'Este libro está agotado.' : `Solo quedan ${l.stock} ejemplares.` };
    }
    if (l.limitada && formato === 'impreso' && enCarro + cantidad > 1) {
      return { ok: false, msg: 'Las ediciones limitadas se venden de a un ejemplar por persona.' };
    }
    if (formato === 'digital' && carro.some(i => i.id === id && i.formato === 'digital')) {
      return { ok: false, msg: 'La versión digital ya está en tu carrito.' };
    }
    if (formato === 'digital' && LC.enBiblioteca(id)) {
      return { ok: false, msg: 'Ya tienes este libro en tu biblioteca digital.' };
    }
    const existente = !perso && carro.find(i => i.id === id && i.formato === formato && !i.perso);
    if (existente && formato === 'impreso') existente.qty += cantidad;
    else carro.push({ key: LC.uid(), id, formato, qty: formato === 'digital' ? 1 : cantidad, perso, extra: perso ? perso.precio : 0 });
    LC.guardar('carrito', carro);
    return { ok: true, msg: `«${l.titulo}» se agregó al carrito.` };
  };
  LC.cambiarCantidad = (key, qty) => {
    const carro = LC.carrito();
    const item = carro.find(i => i.key === key);
    if (!item) return;
    const l = LC.libro(item.id);
    const max = l.limitada ? 1 : l.stock;
    item.qty = Math.max(1, Math.min(qty, max));
    LC.guardar('carrito', carro);
  };
  LC.quitarDelCarrito = key => LC.guardar('carrito', LC.carrito().filter(i => i.key !== key));

  LC.totales = (opciones = {}) => {
    const carro = LC.carrito().filter(i => LC.libro(i.id));
    const subtotal = carro.reduce((s, i) => s + (LC.precio(LC.libro(i.id), i.formato) + (i.extra || 0)) * i.qty, 0);
    const soloDigital = carro.length > 0 && carro.every(i => i.formato === 'digital');
    const codigo = LC.leer('cupon', null);
    const cupon = codigo ? LC.cupones().find(c => c.codigo === codigo) : null;
    let descuento = 0, envioGratisCupon = false, avisoCupon = '';
    if (cupon) {
      if (subtotal < cupon.minimo) avisoCupon = `El cupón ${cupon.codigo} se aplica desde ${LC.clp(cupon.minimo)}.`;
      else if (cupon.tipo === 'pct') descuento = redondear(subtotal * cupon.valor / 100);
      else if (cupon.tipo === 'monto') descuento = Math.min(cupon.valor, subtotal);
      else if (cupon.tipo === 'envio') envioGratisCupon = true;
    }
    const metodo = soloDigital ? 'digital' : (opciones.entrega || 'retiro');
    let envio = soloDigital ? 0 : (LC.CONFIG.envio[metodo] ?? 0);
    if (envioGratisCupon || subtotal >= LC.CONFIG.envio.gratisDesde) envio = 0;
    return { carro, subtotal, descuento, envio, total: Math.max(0, subtotal - descuento + envio), cupon, avisoCupon, soloDigital, cantidad: carro.reduce((s, i) => s + i.qty, 0) };
  };

  /* ---------- Usuario ---------- */
  LC.usuario = () => LC.leer('usuario', null);
  LC.favoritos = () => LC.leer('favoritos', []);
  LC.alternarFavorito = id => {
    const f = LC.favoritos();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    LC.guardar('favoritos', f);
    return i < 0;
  };

  /* ---------- Biblioteca digital ---------- */
  LC.biblioteca = () => LC.leer('biblioteca', []);
  LC.enBiblioteca = id => LC.biblioteca().includes(id);
  LC.agregarABiblioteca = id => {
    const b = LC.biblioteca();
    if (!b.includes(id)) { b.push(id); LC.guardar('biblioteca', b); }
  };

  /* ---------- Notificaciones ---------- */
  LC.notificaciones = () => LC.leer('notifs', []);
  LC.notificar = (tipo, titulo, texto, enlace = '') => {
    const prefs = (LC.usuario() || {}).avisos || { pedidos: true, ofertas: true, club: true };
    if (tipo in prefs && prefs[tipo] === false) return;
    const lista = LC.notificaciones();
    lista.unshift({ id: LC.uid(), tipo, titulo, texto, enlace, fecha: new Date().toISOString(), leida: false });
    LC.guardar('notifs', lista.slice(0, 60));
    if (LC.leer('notifNavegador', false) && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(titulo, { body: texto, tag: tipo }); } catch { /* algunos navegadores solo permiten notificar desde un service worker */ }
    }
  };
  LC.marcarLeidas = (id = null) => {
    LC.guardar('notifs', LC.notificaciones().map(n => (id === null || n.id === id) ? { ...n, leida: true } : n));
  };

  /* ---------- Pedidos ---------- */
  LC.ESTADOS = ['Recibido', 'En preparación', 'Despachado', 'En reparto', 'Entregado'];
  LC.ESTADOS_RETIRO = ['Recibido', 'En preparación', 'Listo para retiro', 'Retirado'];
  LC.estadosDe = p => p.entrega === 'retiro' ? LC.ESTADOS_RETIRO : p.entrega === 'digital' ? ['Pagado', 'Disponible en tu biblioteca'] : LC.ESTADOS;
  LC.pedidos = () => LC.leer('pedidos', []);
  LC.pedido = id => LC.pedidos().find(p => p.id === id);

  LC.crearPedido = ({ cliente, entrega, direccion, pago }) => {
    const t = LC.totales({ entrega });
    const id = 'LC-' + String(Date.now()).slice(-6);
    const ahora = new Date().toISOString();
    const items = t.carro.map(i => {
      const l = LC.libro(i.id);
      return { id: i.id, titulo: l.titulo, formato: i.formato, qty: i.qty, precio: LC.precio(l, i.formato) + (i.extra || 0), perso: i.perso || null };
    });
    const entregaFinal = t.soloDigital ? 'digital' : entrega;
    const pedido = {
      id, fecha: ahora, cliente, entrega: entregaFinal, direccion: ['calama', 'chile'].includes(entregaFinal) ? direccion : null,
      pago, items, subtotal: t.subtotal, descuento: t.descuento, envio: t.envio, total: t.total, cupon: t.cupon ? t.cupon.codigo : null,
      seguimiento: entregaFinal === 'calama' || entregaFinal === 'chile' ? 'CX' + Math.floor(1e9 + Math.random() * 9e9) : null,
      estado: entregaFinal === 'digital' ? 1 : 0,
      historial: [{ estado: 0, fecha: ahora }].concat(entregaFinal === 'digital' ? [{ estado: 1, fecha: ahora }] : []),
    };
    // Descontar existencias y entregar los libros digitales
    const libros = LC.catalogo().map(l => ({ ...l }));
    items.forEach(it => {
      if (it.formato === 'impreso') { const l = libros.find(x => x.id === it.id); if (l) l.stock = Math.max(0, l.stock - it.qty); }
      else LC.agregarABiblioteca(it.id);
    });
    LC.guardarCatalogo(libros);
    LC.guardar('pedidos', [pedido, ...LC.pedidos()]);
    LC.guardar('carrito', []);
    LC.guardar('cupon', null);
    LC.notificar('pedidos', `Pedido ${id} confirmado`, `Recibimos tu pago de ${LC.clp(pedido.total)}.`, '#/pedido/' + id);
    return pedido;
  };

  LC.cambiarEstado = (id, estado) => {
    const pedidos = LC.pedidos();
    const p = pedidos.find(x => x.id === id);
    if (!p) return;
    const estados = LC.estadosDe(p);
    estado = Math.max(0, Math.min(estado, estados.length - 1));
    if (estado === p.estado) return;
    p.estado = estado;
    p.historial = p.historial.filter(h => h.estado < estado).concat({ estado, fecha: new Date().toISOString() });
    LC.guardar('pedidos', pedidos);
    LC.notificar('pedidos', `Pedido ${id}: ${estados[estado].toLowerCase()}`, `Tu pedido cambió a «${estados[estado]}».`, '#/pedido/' + id);
  };

  /* Demostración: sin API de courier, los pedidos avanzan solos cada 2 minutos. */
  LC.MINUTOS_POR_ESTADO = 2;
  LC.avanzarPedidosDemo = () => {
    LC.pedidos().forEach(p => {
      if (p.entrega === 'digital' || p.manual) return;
      const estados = LC.estadosDe(p);
      const minutos = (Date.now() - new Date(p.fecha).getTime()) / 60000;
      const esperado = Math.min(estados.length - 1, Math.floor(minutos / LC.MINUTOS_POR_ESTADO));
      if (esperado > p.estado) LC.cambiarEstado(p.id, esperado);
    });
  };
})();
