/* Cuenta y perfil (24), panel de administración (23) y notificaciones (25). */
(function () {
  const LC = window.LC;
  const { esc, clp, icono, $, $$ } = LC;
  const V = LC.vistas, A = LC.acciones;
  const encabezado = (...a) => LC.encabezado(...a);

  /* Demostración: las cuentas viven en este navegador y no se guarda ninguna contraseña.
     En producción, el registro y el inicio de sesión se validan en el servidor. */
  const cuentas = () => LC.leer('cuentas', {});
  const iniciarSesion = u => { LC.guardar('usuario', u); const c = cuentas(); c[u.email] = u; LC.guardar('cuentas', c); };
  LC.actualizarUsuario = cambios => { const u = { ...LC.usuario(), ...cambios }; iniciarSesion(u); return u; };

  /* ============ 24. Cuenta y perfil ============ */
  V.cuenta = () => {
    const u = LC.usuario();
    if (!u) {
      LC.pintar('Mi cuenta', `${encabezado('Mi cuenta', 'Ingresa para guardar tus pedidos, favoritos y libros digitales.')}
      <div class="dos-columnas dos-columnas--parejas">
        <form id="form-ingresar" class="paso" novalidate>
          <h2>Ingresar</h2>
          ${LC.campo('in-email', 'Correo electrónico', 'type="email" autocomplete="email" required')}
          ${LC.campo('in-clave', 'Contraseña', 'type="password" autocomplete="current-password" required')}
          <button class="btn btn--primario">Ingresar</button>
        </form>
        <form id="form-registro" class="paso" novalidate>
          <h2>Crear cuenta</h2>
          ${LC.campo('re-nombre', 'Nombre', 'autocomplete="name" required')}
          ${LC.campo('re-email', 'Correo electrónico', 'type="email" autocomplete="email" required')}
          ${LC.campo('re-clave', 'Contraseña', 'type="password" autocomplete="new-password" minlength="8" required', 'Al menos 8 caracteres.')}
          <button class="btn">Crear cuenta</button>
        </form>
      </div>
      <p class="tenue chico">Demostración: la cuenta se guarda solo en este navegador y la contraseña no se almacena.</p>`);
      const error = (id, msg) => { $('#' + id).setAttribute('aria-invalid', msg ? 'true' : 'false'); $('#' + id + '-error').textContent = msg || ''; };
      const emailOk = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      $('#form-ingresar').addEventListener('submit', e => {
        e.preventDefault();
        const email = $('#in-email').value.trim().toLowerCase();
        error('in-email', emailOk(email) ? '' : 'Escribe un correo válido.');
        error('in-clave', $('#in-clave').value ? '' : 'Escribe tu contraseña.');
        if (!emailOk(email) || !$('#in-clave').value) return;
        const c = cuentas()[email];
        if (!c) { error('in-email', 'No hay una cuenta con este correo. Crea una cuenta nueva al lado.'); $('#in-email').focus(); return; }
        iniciarSesion(c);
        LC.toast(`Hola de nuevo, ${c.nombre}.`);
        LC.refrescar();
      });
      $('#form-registro').addEventListener('submit', e => {
        e.preventDefault();
        const nombre = $('#re-nombre').value.trim(), email = $('#re-email').value.trim().toLowerCase(), clave = $('#re-clave').value;
        error('re-nombre', nombre ? '' : 'Escribe tu nombre.');
        error('re-email', !emailOk(email) ? 'Escribe un correo válido.' : cuentas()[email] ? 'Ya existe una cuenta con este correo. Ingresa al lado.' : '');
        error('re-clave', clave.length >= 8 ? '' : 'La contraseña necesita al menos 8 caracteres.');
        const primero = $('#form-registro [aria-invalid="true"]');
        if (primero) { primero.focus(); return; }
        iniciarSesion({ uid: LC.uid() + LC.uid(), nombre, email, telefono: '', direccion: '', comuna: 'Calama', region: 'Antofagasta', generos: [], avisos: { pedidos: true, ofertas: true, club: true }, admin: false, creado: new Date().toISOString() });
        LC.notificar('sistema', 'Cuenta creada', `Te damos la bienvenida, ${nombre}. Usa el cupón CALAMA10 en tu primera compra.`, '#/ofertas');
        LC.toast('Cuenta creada.');
        LC.refrescar();
      });
      return;
    }

    const favs = LC.favoritos().map(LC.libro).filter(Boolean);
    const avisos = u.avisos || { pedidos: true, ofertas: true, club: true };
    const permisoNav = 'Notification' in window ? Notification.permission : 'no-soportado';
    LC.pintar('Mi cuenta', `${encabezado(`Hola, ${esc(u.nombre)}`, esc(u.email))}
    <nav class="accesos" aria-label="Accesos de la cuenta">
      <a href="#/pedidos">${icono('camion')} Mis pedidos <span class="tenue">${LC.pedidos().length}</span></a>
      <a href="#/biblioteca">${icono('libro')} Mi biblioteca <span class="tenue">${LC.biblioteca().length}</span></a>
      <a href="#/notificaciones">${icono('campana')} Notificaciones <span class="tenue">${LC.notificaciones().filter(n => !n.leida).length} sin leer</span></a>
      ${u.admin ? `<a href="#/admin">${icono('chispa')} Administración</a>` : ''}
    </nav>
    <div class="dos-columnas dos-columnas--parejas">
      <form id="form-perfil" class="paso" novalidate>
        <h2>Datos personales</h2>
        <div class="grid-campos">
          ${LC.campo('pf-nombre', 'Nombre', `autocomplete="name" value="${esc(u.nombre)}"`)}
          ${LC.campo('pf-telefono', 'Teléfono', `type="tel" autocomplete="tel" value="${esc(u.telefono || '')}"`)}
          ${LC.campo('pf-direccion', 'Dirección', `autocomplete="street-address" value="${esc(u.direccion || '')}"`)}
          ${LC.campo('pf-comuna', 'Comuna', `autocomplete="address-level2" value="${esc(u.comuna || '')}"`)}
        </div>
        <fieldset class="campo"><legend>Géneros que te gustan</legend><div class="chips">
          ${LC.CATEGORIAS.map(c => `<label class="chip"><input type="checkbox" name="generos" value="${c.id}" ${(u.generos || []).includes(c.id) ? 'checked' : ''}><span>${c.nombre}</span></label>`).join('')}
        </div></fieldset>
        <button class="btn btn--primario">Guardar cambios</button>
      </form>
      <div class="pila">
        <form id="form-avisos" class="paso">
          <h2>Avisos</h2>
          <label class="opcion-simple"><input type="checkbox" name="pedidos" ${avisos.pedidos ? 'checked' : ''}> Cambios en mis pedidos</label>
          <label class="opcion-simple"><input type="checkbox" name="ofertas" ${avisos.ofertas ? 'checked' : ''}> Ofertas y libros que esperaba</label>
          <label class="opcion-simple"><input type="checkbox" name="club" ${avisos.club ? 'checked' : ''}> Sesiones del club de lectura</label>
          ${permisoNav === 'no-soportado' ? '' : permisoNav === 'granted'
            ? `<label class="opcion-simple"><input type="checkbox" name="navegador" ${LC.leer('notifNavegador', false) ? 'checked' : ''}> Mostrar también como notificación del navegador</label>`
            : `<button type="button" class="btn btn--chico" data-action="activar-notif-navegador">${icono('campana')} Activar notificaciones del navegador</button>`}
        </form>
        <section class="paso" aria-labelledby="t-seguridad">
          <h2 id="t-seguridad">Huella o rostro</h2>
          <p>${u.passkey ? `${icono('check')} Registraste una passkey el ${LC.fecha(u.passkey.fecha)}. Puedes usarla para confirmar compras.` : 'Registra la huella o el rostro de este dispositivo para confirmar compras sin escribir los datos de la tarjeta.'}</p>
          <button class="btn" data-action="registrar-passkey">${icono('huella')} ${u.passkey ? 'Registrar de nuevo' : 'Registrar huella o rostro'}</button>
          <p class="tenue chico">Tu huella o tu rostro nunca salen del dispositivo: la librería solo recibe una llave pública.</p>
        </section>
      </div>
    </div>
    <section class="bloque" aria-labelledby="t-favs">
      <h2 id="t-favs">Favoritos</h2>
      ${favs.length ? `<div class="fila-libros">${favs.map(LC.tarjeta).join('')}</div>` : '<p>Guarda libros con el botón «Guardar en favoritos» de cada ficha para encontrarlos aquí.</p>'}
    </section>
    <div class="fila-botones"><button class="btn" data-action="cerrar-sesion">Cerrar sesión</button></div>`);

    $('#form-perfil').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const nombre = fd.get('pf-nombre').trim();
      if (!nombre) { $('#pf-nombre').setAttribute('aria-invalid', 'true'); $('#pf-nombre-error').textContent = 'Escribe tu nombre.'; $('#pf-nombre').focus(); return; }
      LC.actualizarUsuario({ nombre, telefono: fd.get('pf-telefono').trim(), direccion: fd.get('pf-direccion').trim(), comuna: fd.get('pf-comuna').trim(), generos: fd.getAll('generos') });
      LC.toast('Cambios guardados.');
      LC.refrescar();
    });
    $('#form-avisos').addEventListener('change', e => {
      const fd = new FormData(e.currentTarget);
      LC.actualizarUsuario({ avisos: { pedidos: fd.has('pedidos'), ofertas: fd.has('ofertas'), club: fd.has('club') } });
      if (e.target.name === 'navegador') LC.guardar('notifNavegador', e.target.checked);
      LC.toast('Preferencias de avisos guardadas.');
    });
  };

  A['cerrar-sesion'] = () => { LC.guardar('usuario', null); LC.toast('Cerraste sesión.'); LC.refrescar(); };
  A['registrar-passkey'] = async () => {
    const r = await LC.biometria.registrar();
    LC.toast(r.msg, r.ok ? 'ok' : 'error');
    if (r.ok) LC.refrescar();
  };
  A['activar-notif-navegador'] = async () => {
    if (!('Notification' in window)) return;
    const permiso = await Notification.requestPermission();
    if (permiso === 'granted') { LC.guardar('notifNavegador', true); LC.toast('Listo: también verás los avisos como notificaciones del navegador.'); }
    else LC.toast('El navegador bloqueó las notificaciones. Puedes permitirlas desde el candado de la barra de direcciones.', 'error');
    LC.refrescar();
  };

  /* ============ 25. Notificaciones ============ */
  const ICONO_TIPO = { pedidos: 'camion', ofertas: 'chispa', club: 'video', sistema: 'campana' };
  const NOMBRE_TIPO = { pedidos: 'Pedido', ofertas: 'Oferta', club: 'Club', sistema: 'Librería' };
  V.notificaciones = (_, q) => {
    const filtro = q.filtro || 'todas';
    const todas = LC.notificaciones();
    const lista = filtro === 'sin-leer' ? todas.filter(n => !n.leida) : todas;
    const sinLeer = todas.filter(n => !n.leida).length;
    LC.pintar('Notificaciones', `${encabezado('Notificaciones', sinLeer ? LC.plural(sinLeer, 'aviso sin leer', 'avisos sin leer') : 'Estás al día.')}
      <div class="barra-acciones">
        <nav class="filtro-seg" aria-label="Filtrar avisos">
          <a href="#/notificaciones" ${filtro === 'todas' ? 'aria-current="page"' : ''}>Todas</a>
          <a href="#/notificaciones?filtro=sin-leer" ${filtro === 'sin-leer' ? 'aria-current="page"' : ''}>Sin leer</a>
        </nav>
        <div class="fila-botones">
          ${sinLeer ? '<button class="btn btn--chico" data-action="marcar-leidas">Marcar todas como leídas</button>' : ''}
          ${'Notification' in window && Notification.permission !== 'granted' ? `<button class="btn btn--chico" data-action="activar-notif-navegador">${icono('campana')} Recibir en el navegador</button>` : ''}
        </div>
      </div>
      ${lista.length ? `<ul class="notifs">${lista.map(n => `<li class="notif ${n.leida ? '' : 'notif--nueva'}">
          <span class="notif__icono">${icono(ICONO_TIPO[n.tipo] || 'campana')}</span>
          <div class="notif__cuerpo">
            <p class="notif__titulo"><strong>${esc(n.titulo)}</strong>${n.leida ? '' : '<span class="sr"> (sin leer)</span>'}</p>
            <p>${esc(n.texto)}</p>
            <p class="tenue chico">${NOMBRE_TIPO[n.tipo] || 'Aviso'}, ${LC.fecha(n.fecha, true)}</p>
          </div>
          <div class="notif__acciones">
            ${n.enlace ? `<a class="btn btn--chico" href="${esc(n.enlace)}" data-leer="${n.id}">Ver</a>` : ''}
            ${n.leida ? '' : `<button class="enlace-accion" data-action="marcar-leida" data-id="${n.id}">Marcar como leída</button>`}
          </div></li>`).join('')}</ul>`
        : `<div class="vacio"><p>${filtro === 'sin-leer' ? 'No tienes avisos sin leer.' : 'No tienes avisos. Aquí verás los cambios de tus pedidos, las ofertas nuevas y las sesiones del club.'}</p></div>`}
      <p class="tenue chico"><a href="#/cuenta">Elige qué avisos recibir</a> en tu cuenta.</p>`);
    $$('[data-leer]').forEach(a => a.addEventListener('click', () => LC.marcarLeidas(a.dataset.leer)));
  };
  A['marcar-leidas'] = () => { LC.marcarLeidas(); LC.refrescar(); };
  A['marcar-leida'] = b => { LC.marcarLeidas(b.dataset.id); LC.refrescar(); };

  /* ============ 23. Panel de administración ============ */
  const PESTANAS = [['resumen', 'Resumen'], ['libros', 'Libros'], ['pedidos', 'Pedidos'], ['cupones', 'Cupones'], ['avisos', 'Enviar aviso']];
  const COLORES = ['#0E5B50', '#2E8F8A', '#9C4A1C', '#23468C', '#5A2A4F', '#2D3436', '#9B2A6B', '#7A3B1E', '#1B2A4A', '#4F7A5A'];

  V.admin = (_, q) => {
    const u = LC.usuario();
    if (!u || !u.admin) {
      return LC.pintar('Administración', `${encabezado('Panel de administración')}
        <div class="vacio"><p>Esta sección es para el equipo de la librería.</p>
        <button class="btn btn--primario" data-action="entrar-admin">Entrar como administrador (demostración)</button>
        <p class="tenue chico">En producción el acceso se valida en el servidor, con usuario y rol.</p></div>`);
    }
    const tab = PESTANAS.some(([k]) => k === q.tab) ? q.tab : 'resumen';
    const libros = LC.catalogo(), pedidos = LC.pedidos();
    let cuerpo = '';

    if (tab === 'resumen') {
      const ventas = pedidos.reduce((s, p) => s + p.total, 0);
      const enCurso = pedidos.filter(p => p.estado < LC.estadosDe(p).length - 1).length;
      const bajo = libros.filter(l => l.formatos.includes('impreso') && l.stock <= 3);
      const vendidos = {};
      pedidos.forEach(p => p.items.forEach(i => { vendidos[i.id] = (vendidos[i.id] || 0) + i.qty; }));
      const top = Object.entries(vendidos).sort((a, b) => b[1] - a[1]).slice(0, 5);
      cuerpo = `
        <dl class="cifras">
          <div><dt>Ventas</dt><dd>${clp(ventas)}</dd></div>
          <div><dt>Pedidos</dt><dd>${pedidos.length}</dd></div>
          <div><dt>En curso</dt><dd>${enCurso}</dd></div>
          <div><dt>Venta promedio</dt><dd>${clp(pedidos.length ? Math.round(ventas / pedidos.length) : 0)}</dd></div>
        </dl>
        <div class="dos-columnas dos-columnas--parejas">
          <section><h2>Existencias bajas</h2>${bajo.length ? `<ul class="lista-simple">${bajo.map(l => `<li><a href="#/admin?tab=libros">${esc(l.titulo)}</a><span class="${l.stock ? '' : 'texto-alerta'}">${l.stock ? LC.plural(l.stock, 'ejemplar', 'ejemplares') : 'Agotado'}</span></li>`).join('')}</ul>` : '<p>Todos los libros tienen más de 3 ejemplares.</p>'}</section>
          <section><h2>Más vendidos</h2>${top.length ? `<ol class="lista-simple">${top.map(([id, n]) => `<li><span>${esc((LC.libro(id) || { titulo: id }).titulo)}</span><span>${n}</span></li>`).join('')}</ol>` : '<p>Aún no hay ventas. Haz una compra de prueba para ver datos aquí.</p>'}</section>
        </div>
        <section class="bloque"><h2>Datos de demostración</h2><p>Borra pedidos, cuentas, carrito y cambios del catálogo guardados en este navegador.</p><button class="btn" data-action="restablecer">Restablecer datos de demostración</button></section>`;
    }

    if (tab === 'libros') {
      cuerpo = `
        <div class="tabla-envoltura" tabindex="0" role="region" aria-label="Libros del catálogo">
        <table class="tabla tabla--admin">
          <thead><tr><th scope="col">Libro</th><th scope="col">Precio</th><th scope="col">Oferta %</th><th scope="col">Existencias</th><th scope="col"><span class="sr">Acciones</span></th></tr></thead>
          <tbody>${libros.map(l => `<tr data-id="${l.id}">
            <th scope="row"><a href="#/libro/${l.id}">${esc(l.titulo)}</a><span class="tenue chico">${esc(l.autor)}</span></th>
            <td><label class="sr" for="pr-${l.id}">Precio de ${esc(l.titulo)}</label><input id="pr-${l.id}" type="number" min="0" step="10" name="precio" value="${l.precio}"></td>
            <td><label class="sr" for="of-${l.id}">Oferta de ${esc(l.titulo)}</label><input id="of-${l.id}" type="number" min="0" max="90" name="oferta" value="${l.oferta || 0}"></td>
            <td><label class="sr" for="st-${l.id}">Existencias de ${esc(l.titulo)}</label><input id="st-${l.id}" type="number" min="0" name="stock" value="${l.stock}"></td>
            <td class="celda-acciones"><button class="btn btn--chico" data-action="guardar-libro" data-id="${l.id}">Guardar</button><button class="btn-icono" data-action="eliminar-libro" data-id="${l.id}" aria-label="Eliminar ${esc(l.titulo)}">${icono('basura')}</button></td>
          </tr>`).join('')}</tbody>
        </table></div>
        <form id="form-libro" class="paso bloque">
          <h2>Agregar libro</h2>
          <div class="grid-campos">
            ${LC.campo('nl-titulo', 'Título', 'required')}
            ${LC.campo('nl-autor', 'Autor', 'required')}
            <div class="campo"><label for="nl-cat">Categoría</label><select id="nl-cat" name="nl-cat">${LC.CATEGORIAS.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}</select></div>
            ${LC.campo('nl-anio', 'Año de primera edición', 'type="number" min="1400" max="2100" required')}
            ${LC.campo('nl-precio', 'Precio', 'type="number" min="0" step="10" required')}
            ${LC.campo('nl-stock', 'Existencias', 'type="number" min="0" value="1" required')}
            ${LC.campo('nl-paginas', 'Páginas', 'type="number" min="1" value="200"')}
          </div>
          <div class="campo"><label for="nl-desc">Descripción</label><textarea id="nl-desc" name="nl-desc" rows="3" required></textarea></div>
          <button class="btn btn--primario">Agregar al catálogo</button>
        </form>`;
    }

    if (tab === 'pedidos') {
      cuerpo = pedidos.length ? `<div class="tabla-envoltura" tabindex="0" role="region" aria-label="Pedidos">
        <table class="tabla">
          <thead><tr><th scope="col">Pedido</th><th scope="col">Fecha</th><th scope="col">Cliente</th><th scope="col">Entrega</th><th scope="col">Total</th><th scope="col">Estado</th></tr></thead>
          <tbody>${pedidos.map(p => `<tr><th scope="row"><a href="#/pedido/${p.id}">${p.id}</a></th><td>${LC.fecha(p.fecha, true)}</td><td>${esc(p.cliente.nombre)}</td><td>${p.entrega}</td><td>${clp(p.total)}</td>
            <td><label class="sr" for="es-${p.id}">Estado de ${p.id}</label><select id="es-${p.id}" data-estado="${p.id}">${LC.estadosDe(p).map((e, i) => `<option value="${i}" ${i === p.estado ? 'selected' : ''}>${e}</option>`).join('')}</select></td></tr>`).join('')}</tbody>
        </table></div><p class="tenue chico">Al cambiar un estado a mano, ese pedido deja de avanzar solo y el cliente recibe un aviso.</p>` : '<div class="vacio"><p>Aún no hay pedidos.</p></div>';
    }

    if (tab === 'cupones') {
      const cs = LC.cupones();
      cuerpo = `<ul class="lista-simple">${cs.map(c => `<li><span><strong>${esc(c.codigo)}</strong> ${esc(c.desc)}</span><button class="btn-icono" data-action="eliminar-cupon" data-codigo="${esc(c.codigo)}" aria-label="Eliminar cupón ${esc(c.codigo)}">${icono('basura')}</button></li>`).join('')}</ul>
        <form id="form-cupon-admin" class="paso bloque">
          <h2>Crear cupón</h2>
          <div class="grid-campos">
            ${LC.campo('nc-codigo', 'Código', 'required maxlength="20" style="text-transform:uppercase"')}
            <div class="campo"><label for="nc-tipo">Tipo</label><select id="nc-tipo" name="nc-tipo"><option value="pct">Porcentaje</option><option value="monto">Monto fijo</option><option value="envio">Envío gratis</option></select></div>
            ${LC.campo('nc-valor', 'Valor', 'type="number" min="0" value="10"')}
            ${LC.campo('nc-minimo', 'Compra mínima', 'type="number" min="0" value="0"')}
          </div>
          ${LC.campo('nc-desc', 'Descripción para clientes', 'required')}
          <button class="btn btn--primario">Crear cupón</button>
        </form>`;
    }

    if (tab === 'avisos') {
      cuerpo = `<form id="form-aviso" class="paso">
        <h2>Enviar un aviso</h2>
        <p>Llega al centro de notificaciones de quienes aceptaron ese tipo de aviso.</p>
        <div class="campo"><label for="av-tipo">Tipo</label><select id="av-tipo" name="av-tipo"><option value="ofertas">Oferta</option><option value="club">Club de lectura</option><option value="sistema">Librería</option></select></div>
        ${LC.campo('av-titulo', 'Título', 'required maxlength="60"')}
        <div class="campo"><label for="av-texto">Mensaje</label><textarea id="av-texto" name="av-texto" rows="3" required maxlength="200"></textarea></div>
        ${LC.campo('av-enlace', 'Enlace (opcional)', 'placeholder="#/ofertas"')}
        <button class="btn btn--primario">Enviar aviso</button>
      </form>`;
    }

    LC.pintar('Administración', `${encabezado('Panel de administración')}
      <nav class="pestanas-nav" aria-label="Secciones de administración">${PESTANAS.map(([k, t]) => `<a href="#/admin?tab=${k}" ${k === tab ? 'aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
      <div class="admin">${cuerpo}</div>`);

    const formLibro = $('#form-libro');
    if (formLibro) formLibro.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(formLibro);
      const titulo = fd.get('nl-titulo').trim();
      if (!titulo || !fd.get('nl-autor').trim() || !fd.get('nl-precio') || !fd.get('nl-desc').trim()) { LC.toast('Completa título, autor, precio y descripción.', 'error'); return; }
      let id = LC.normalizar(titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (LC.libro(id)) id += '-' + LC.uid().slice(0, 4);
      const lista = LC.catalogo().concat({
        id, titulo, autor: fd.get('nl-autor').trim(), anio: +fd.get('nl-anio') || new Date().getFullYear(), cat: fd.get('nl-cat'), precio: +fd.get('nl-precio'), oferta: 0,
        stock: +fd.get('nl-stock'), paginas: +fd.get('nl-paginas') || 200, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: true,
        color: COLORES[Math.floor(Math.random() * COLORES.length)], tinta: '#FFFFFF', descripcion: fd.get('nl-desc').trim(),
      });
      LC.guardarCatalogo(lista);
      LC.toast(`«${titulo}» se agregó al catálogo.`);
      LC.refrescar();
    });
    $$('[data-estado]').forEach(s => s.addEventListener('change', () => {
      const ps = LC.pedidos();
      const p = ps.find(x => x.id === s.dataset.estado);
      p.manual = true;
      LC.guardar('pedidos', ps);
      LC.cambiarEstado(p.id, +s.value);
      LC.toast(`Pedido ${p.id} actualizado.`);
    }));
    const formCupon = $('#form-cupon-admin');
    if (formCupon) formCupon.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(formCupon);
      const codigo = fd.get('nc-codigo').trim().toUpperCase().replace(/\s+/g, '');
      if (!codigo || !fd.get('nc-desc').trim()) { LC.toast('Escribe el código y la descripción del cupón.', 'error'); return; }
      if (LC.cupones().some(c => c.codigo === codigo)) { LC.toast(`Ya existe el cupón ${codigo}.`, 'error'); return; }
      LC.guardar('cupones', LC.cupones().concat({ codigo, tipo: fd.get('nc-tipo'), valor: +fd.get('nc-valor') || 0, minimo: +fd.get('nc-minimo') || 0, desc: fd.get('nc-desc').trim() }));
      LC.notificar('ofertas', `Nuevo cupón: ${codigo}`, fd.get('nc-desc').trim(), '#/ofertas');
      LC.toast(`Cupón ${codigo} creado.`);
      LC.refrescar();
    });
    const formAviso = $('#form-aviso');
    if (formAviso) formAviso.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(formAviso);
      if (!fd.get('av-titulo').trim() || !fd.get('av-texto').trim()) { LC.toast('Escribe el título y el mensaje.', 'error'); return; }
      const enlace = fd.get('av-enlace').trim();
      LC.notificar(fd.get('av-tipo'), fd.get('av-titulo').trim(), fd.get('av-texto').trim(), enlace.startsWith('#/') ? enlace : '');
      LC.toast('Aviso enviado.');
      formAviso.reset();
    });
  };

  A['entrar-admin'] = () => {
    const u = LC.usuario() || { uid: LC.uid() + LC.uid(), nombre: 'Equipo Librería Calama', email: 'equipo@demo.local', avisos: { pedidos: true, ofertas: true, club: true }, generos: [] };
    LC.actualizarUsuario({ ...u, admin: true });
    LC.toast('Entraste como administrador.');
    LC.refrescar();
  };
  A['guardar-libro'] = b => {
    const fila = b.closest('tr');
    const val = n => Math.max(0, Number($(`[name="${n}"]`, fila).value) || 0);
    const lista = LC.catalogo().map(l => ({ ...l }));
    const l = lista.find(x => x.id === b.dataset.id);
    const volvio = l.stock <= 0 && val('stock') > 0;
    const bajo = val('oferta') > (l.oferta || 0);
    Object.assign(l, { precio: val('precio'), oferta: Math.min(90, val('oferta')), stock: val('stock') });
    LC.guardarCatalogo(lista);
    const esperando = LC.leer('avisosStock', []);
    if (volvio && esperando.includes(l.id)) {
      LC.notificar('ofertas', `Volvió «${l.titulo}»`, 'El libro que esperabas está disponible otra vez.', '#/libro/' + l.id);
      LC.guardar('avisosStock', esperando.filter(x => x !== l.id));
    }
    if (bajo && LC.favoritos().includes(l.id)) LC.notificar('ofertas', `«${l.titulo}» bajó de precio`, `Uno de tus favoritos tiene ${l.oferta} % de descuento.`, '#/libro/' + l.id);
    LC.toast(`«${l.titulo}» actualizado.`);
  };
  A['eliminar-libro'] = async b => {
    const l = LC.libro(b.dataset.id);
    if (!(await LC.confirmar('Eliminar libro', `¿Eliminar «${esc(l.titulo)}» del catálogo? Los pedidos anteriores no cambian.`, 'Eliminar libro'))) return;
    LC.guardarCatalogo(LC.catalogo().filter(x => x.id !== l.id));
    LC.guardar('carrito', LC.carrito().filter(i => i.id !== l.id));
    LC.toast(`«${l.titulo}» se eliminó del catálogo.`);
    LC.refrescar();
  };
  A['eliminar-cupon'] = b => { LC.guardar('cupones', LC.cupones().filter(c => c.codigo !== b.dataset.codigo)); LC.toast(`Cupón ${b.dataset.codigo} eliminado.`); LC.refrescar(); };
  A.restablecer = async () => {
    if (!(await LC.confirmar('Restablecer datos', 'Se borrarán pedidos, cuentas, carrito, preferencias y cambios del catálogo guardados en este navegador.', 'Restablecer'))) return;
    LC.restablecerTodo();
    location.hash = '#/';
    location.reload();
  };
})();
