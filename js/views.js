/* Vistas de la tienda: inicio, catálogo, categorías, ficha, carrito, pago, pedidos, ofertas,
   ediciones limitadas, personalización, nosotros, módulos y accesibilidad. */
(function () {
  const LC = window.LC;
  const { esc, clp, icono, $, $$ } = LC;
  const V = LC.vistas = LC.vistas || {};
  const A = LC.acciones = LC.acciones || {};

  LC.pintar = (titulo, html) => {
    $('#contenido').innerHTML = html;
    document.title = titulo ? `${titulo} | Librería Calama` : 'Librería Calama';
  };
  const pintar = LC.pintar;
  const encabezado = (titulo, bajada = '') => `<header class="encabezado"><h1 tabindex="-1">${titulo}</h1>${bajada ? `<p class="bajada">${bajada}</p>` : ''}</header>`;
  LC.encabezado = encabezado;
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  LC.plural = plural;

  const APELLIDOS = { 'Gabriel García Márquez': 'García Márquez', 'Antoine de Saint-Exupéry': 'Saint-Exupéry', 'Alberto Blest Gana': 'Blest Gana', 'Miguel de Cervantes': 'Cervantes' };
  const apellido = a => APELLIDOS[a] || a.split(' ').slice(-1)[0];
  const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

  /* ============ 1. Inicio ============ */
  V.inicio = () => {
    const libros = LC.catalogo();
    const estante = libros.filter(l => !l.id.endsWith('centenario')).slice(0, 18);
    const lomos = estante.map((l, i) => {
      const alto = 70 + hash(l.id) % 30;
      const ancho = Math.round(34 + Math.min(l.paginas, 600) / 600 * 28);
      return `<a class="lomo" href="#/libro/${l.id}" style="--c:${l.color};--t:${l.tinta};--alto:${alto}%;--ancho:${ancho}px;--i:${i}">
        <span class="lomo__titulo">${esc(l.titulo)}</span><span class="lomo__autor">${esc(apellido(l.autor))}</span>
        <span class="sr">, de ${esc(l.autor)}</span></a>`;
    }).join('');
    const novedades = libros.filter(l => l.nuevo && !l.limitada).slice(0, 5);
    const ofertas = libros.filter(l => l.oferta > 0).slice(0, 5);
    const limitada = libros.find(l => l.limitada && l.stock > 0);
    const club = LC.CLUBES[0], libroClub = LC.libro(club.libro);

    pintar('', `
    <section class="inicio">
      <div class="inicio__texto">
        <h1 tabindex="-1">La librería de Calama, ahora también en línea.</h1>
        <div class="inicio__lado">
          <p class="bajada">Libros impresos con retiro en tienda o despacho a todo Chile, lectura digital y un club para leer en compañía.</p>
          <div class="fila-botones">
            <a class="btn btn--primario" href="#/catalogo">Ver catálogo</a>
            <a class="btn" href="#/club">Conocer el club de lectura</a>
          </div>
        </div>
      </div>
      <nav class="estante" aria-label="Estante de libros">
        <div class="estante__libros">${lomos}</div>
      </nav>
    </section>

    <section class="bloque">
      <div class="bloque__cab"><h2>Novedades</h2><a href="#/catalogo?orden=nuevos">Ver todo el catálogo</a></div>
      <div class="fila-libros">${novedades.map(LC.tarjeta).join('')}</div>
    </section>

    <section class="bloque bloque--partido">
      <div>
        <h2>Explora por categoría</h2>
        <ul class="lista-categorias">${LC.CATEGORIAS.map(c => {
          const n = libros.filter(l => l.cat === c.id).length;
          return `<li><a href="#/categoria/${c.id}"><span>${c.nombre}</span><span class="tenue">${plural(n, 'libro', 'libros')}</span></a></li>`;
        }).join('')}</ul>
      </div>
      ${limitada ? `<div class="destacado">
        <a href="#/libro/${limitada.id}" class="destacado__portada">${LC.portada(limitada, 'portada--grande')}</a>
        <div>
          <h2>Edición limitada</h2>
          <p class="destacado__titulo">${esc(limitada.titulo)}</p>
          <p>${esc(limitada.limitada.detalle)}</p>
          <p class="existencias"><progress max="${limitada.limitada.total}" value="${limitada.stock}"></progress> Quedan ${limitada.stock} de ${limitada.limitada.total} ejemplares.</p>
          <a class="btn" href="#/limitadas">Ver ediciones limitadas</a>
        </div>
      </div>` : ''}
    </section>

    <section class="bloque">
      <div class="bloque__cab"><h2>En oferta</h2><a href="#/ofertas">Ver ofertas y cupones</a></div>
      <div class="fila-libros">${ofertas.map(LC.tarjeta).join('')}</div>
    </section>

    <section class="bloque bloque--partido">
      <div class="club-destacado">
        <h2>Club de lectura</h2>
        <p><strong>${club.nombre}</strong>, ${club.cuando.toLowerCase()}. Leyendo «${esc(libroClub.titulo)}».</p>
        <p>${club.desc} Puedes venir a la tienda o conectarte por videollamada.</p>
        <a class="btn" href="#/club">Ver todos los clubes</a>
      </div>
      <div>
        <h2>Leer a tu manera</h2>
        <ul class="lista-a11y">
          <li><div><strong>Navegación por voz</strong><span>Di «ir a ofertas» o «buscar Neruda».</span></div><button class="btn btn--chico" data-action="voz">${icono('mic')} Activar voz</button></li>
          <li><div><strong>Lectura en voz alta</strong><span>Escucha cualquier página del sitio.</span></div><button class="btn btn--chico" data-action="leer-pagina">${icono('volumen')} Escuchar</button></li>
          <li><div><strong>Lengua de señas chilena</strong><span>Videos en LSCh para cada sección.</span></div><button class="btn btn--chico" data-action="lsch">${icono('mano')} Abrir intérprete</button></li>
          <li><div><strong>Colores y letra</strong><span>Tema oscuro, alto contraste y letra más grande.</span></div><button class="btn btn--chico" data-action="panel-a11y">${icono('texto')} Ajustar</button></li>
        </ul>
      </div>
    </section>`);
  };

  /* ============ 2 y 3. Catálogo y categorías ============ */
  const ORDENES = { relevancia: 'Relevancia', 'precio-asc': 'Precio: menor a mayor', 'precio-desc': 'Precio: mayor a menor', titulo: 'Título (A a Z)', nuevos: 'Novedades primero' };

  V.catalogo = (params = [], q = {}) => {
    const libros = LC.catalogo();
    const catId = params.cat || q.cat || '';
    const cat = LC.categoria(catId);
    const maxPrecio = Math.ceil(Math.max(...libros.map(l => l.precio)) / 1000) * 1000;
    const titulo = cat ? cat.nombre : 'Catálogo';
    pintar(titulo, `
      ${cat ? `<nav class="migas" aria-label="Ruta"><a href="#/categorias">Categorías</a></nav>` : ''}
      ${encabezado(titulo, cat ? cat.desc : 'Todos los libros de la librería, impresos y digitales.')}
      <div class="catalogo">
        <form class="filtros" id="filtros" aria-label="Filtros del catálogo">
          <div class="campo"><label for="f-q">Buscar</label><input id="f-q" name="q" type="search" value="${esc(q.q || '')}" placeholder="Título o autor"></div>
          <fieldset class="campo"><legend>Categoría</legend>
            <label class="opcion-simple"><input type="radio" name="cat" value="" ${!catId ? 'checked' : ''}> Todas</label>
            ${LC.CATEGORIAS.map(c => `<label class="opcion-simple"><input type="radio" name="cat" value="${c.id}" ${c.id === catId ? 'checked' : ''}> ${c.nombre}</label>`).join('')}
          </fieldset>
          <div class="campo"><label for="f-formato">Formato</label>
            <select id="f-formato" name="formato"><option value="">Todos</option><option value="impreso" ${q.formato === 'impreso' ? 'selected' : ''}>Impreso</option><option value="digital" ${q.formato === 'digital' ? 'selected' : ''}>Digital</option></select></div>
          <div class="campo"><label for="f-max">Precio máximo: <output id="f-max-out" for="f-max">${clp(maxPrecio)}</output></label>
            <input type="range" id="f-max" name="max" min="5000" max="${maxPrecio}" step="1000" value="${q.max || maxPrecio}"></div>
          <label class="opcion-simple"><input type="checkbox" name="oferta" ${q.oferta ? 'checked' : ''}> Solo libros en oferta</label>
          <label class="opcion-simple"><input type="checkbox" name="disponible"> Solo con existencias</label>
          <button type="reset" class="btn btn--chico">Limpiar filtros</button>
        </form>
        <div>
          <div class="resultados__barra">
            <p id="conteo" role="status"></p>
            <label class="orden">Ordenar por <select id="f-orden">${Object.entries(ORDENES).map(([k, v]) => `<option value="${k}" ${q.orden === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          </div>
          <div class="grilla-libros" id="resultados"></div>
        </div>
      </div>`);

    const form = $('#filtros'), orden = $('#f-orden');
    const actualizar = () => {
      const f = Object.fromEntries(new FormData(form));
      const termino = LC.normalizar(f.q).trim();
      let res = libros.filter(l =>
        (!f.cat || l.cat === f.cat) &&
        (!f.formato || l.formatos.includes(f.formato)) &&
        LC.precio(l) <= +f.max &&
        (!f.oferta || l.oferta > 0) &&
        (!f.disponible || l.stock > 0 || l.formatos.includes('digital')));
      const puntaje = l => {
        if (!termino) return 0;
        const t = LC.normalizar(l.titulo), a = LC.normalizar(l.autor), d = LC.normalizar(l.descripcion + ' ' + (LC.categoria(l.cat) || {}).nombre);
        return termino.split(/\s+/).reduce((s, p) => s + (t.includes(p) ? 5 : 0) + (a.includes(p) ? 4 : 0) + (d.includes(p) ? 1 : 0), 0);
      };
      if (termino) res = res.map(l => [l, puntaje(l)]).filter(([, p]) => p > 0).sort((a, b) => b[1] - a[1]).map(([l]) => l);
      const o = orden.value;
      if (o === 'precio-asc') res.sort((a, b) => LC.precio(a) - LC.precio(b));
      if (o === 'precio-desc') res.sort((a, b) => LC.precio(b) - LC.precio(a));
      if (o === 'titulo') res.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
      if (o === 'nuevos') res.sort((a, b) => (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0));
      $('#f-max-out').textContent = clp(+f.max);
      $('#conteo').textContent = res.length ? plural(res.length, 'libro', 'libros') : '';
      $('#resultados').innerHTML = res.length ? res.map(LC.tarjeta).join('')
        : `<div class="vacio"><p>No hay libros con estos filtros.</p><p>Prueba con otra palabra o <button class="enlace-accion" type="button" id="limpiar-vacio">limpia los filtros</button>. Si buscas un título que no tenemos, escríbenos y lo encargamos.</p></div>`;
      const limpiar = $('#limpiar-vacio');
      if (limpiar) limpiar.addEventListener('click', () => { form.reset(); });
    };
    form.addEventListener('input', actualizar);
    form.addEventListener('change', actualizar);
    form.addEventListener('reset', () => setTimeout(() => { $('#f-max').value = maxPrecio; actualizar(); }));
    form.addEventListener('submit', e => e.preventDefault());
    orden.addEventListener('change', actualizar);
    actualizar();
  };

  V.categorias = () => {
    const libros = LC.catalogo();
    pintar('Categorías', `${encabezado('Categorías', 'Elige por dónde empezar.')}
      <ul class="categorias">${LC.CATEGORIAS.map(c => {
        const ls = libros.filter(l => l.cat === c.id);
        return `<li><a class="categoria" href="#/categoria/${c.id}">
          <span class="categoria__portadas">${ls.slice(0, 3).map(l => LC.portada(l, 'portada--mini')).join('')}</span>
          <span class="categoria__texto"><span class="categoria__nombre">${c.nombre}</span><span>${c.desc}</span><span class="tenue">${plural(ls.length, 'libro', 'libros')}</span></span>
        </a></li>`;
      }).join('')}</ul>`);
  };
  V.categoria = ([id]) => LC.categoria(id) ? V.catalogo({ cat: id }, {}) : V.noEncontrado();

  /* ============ 9. Ficha individual ============ */
  V.libro = ([id]) => {
    const l = LC.libro(id);
    if (!l) return V.noEncontrado();
    const cat = LC.categoria(l.cat);
    const { promedio, total } = LC.calificacion(id);
    const resenas = LC.leer('resenas', {})[id] || [];
    const fav = LC.favoritos().includes(id);
    const relacionados = LC.catalogo().filter(x => x.cat === l.cat && x.id !== id).slice(0, 5);
    const formatoInicial = l.stock > 0 || !l.formatos.includes('digital') ? 'impreso' : 'digital';
    const texto = l.texto && LC.TEXTOS[l.texto];
    const u = LC.usuario();

    pintar(l.titulo, `
    <nav class="migas" aria-label="Ruta"><a href="#/catalogo">Catálogo</a> / <a href="#/categoria/${cat.id}">${cat.nombre}</a></nav>
    <article class="ficha">
      <div class="ficha__portada">${LC.portada(l, 'portada--grande')}</div>
      <div class="ficha__info">
        <h1 tabindex="-1">${esc(l.titulo)}</h1>
        <p class="ficha__autor"><a href="#/catalogo?q=${encodeURIComponent(l.autor)}">${esc(l.autor)}</a></p>
        <p class="ficha__nota">${total ? `${LC.estrellas(promedio)} <button class="enlace-accion" data-action="ir-a" data-destino="resenas">${plural(total, 'reseña', 'reseñas')}</button>` : `<button class="enlace-accion" data-action="ir-a" data-destino="resenas">Sin reseñas todavía</button>`}</p>
        ${l.limitada ? `<p class="aviso aviso--limitada">Edición limitada de ${l.limitada.total} ejemplares numerados. ${l.stock > 0 ? `Quedan ${l.stock}.` : 'Agotada.'} ${esc(l.limitada.detalle)}</p>` : ''}

        <form class="compra" id="form-compra">
          <fieldset><legend>Formato</legend>
            ${l.formatos.map(f => {
              const sinStock = f === 'impreso' && l.stock <= 0;
              const nota = f === 'impreso'
                ? (l.stock > 0 ? `${plural(l.stock, 'ejemplar disponible', 'ejemplares disponibles')}` : 'Agotado')
                : (LC.precio(l, f) === 0 ? 'Dominio público: gratis en tu biblioteca' : 'Se lee en el lector de la librería');
              return `<label class="opcion"><input type="radio" name="formato" value="${f}" ${f === formatoInicial ? 'checked' : ''} ${sinStock ? 'disabled' : ''}>
                <span class="opcion__cuerpo"><span class="opcion__titulo">${f === 'impreso' ? 'Impreso' : 'Digital'}</span><span>${LC.precioHTML(l, f)}</span><small>${nota}</small></span></label>`;
            }).join('')}
          </fieldset>
          <div class="campo campo--cantidad" id="campo-cantidad" ${formatoInicial === 'digital' ? 'hidden' : ''}>
            <label for="cantidad">Cantidad</label>
            <input id="cantidad" name="cantidad" type="number" inputmode="numeric" min="1" max="${l.limitada ? 1 : Math.max(1, l.stock)}" value="1">
          </div>
          <div class="fila-botones">
            <button class="btn btn--primario" type="submit" ${l.stock <= 0 && !l.formatos.includes('digital') ? 'disabled' : ''}>${l.stock <= 0 && !l.formatos.includes('digital') ? 'Agotado' : 'Agregar al carrito'}</button>
            <button type="button" class="btn" data-action="favorito" data-id="${id}" aria-pressed="${fav}">${icono('corazon', fav ? 'llena' : '')} ${fav ? 'En favoritos' : 'Guardar en favoritos'}</button>
          </div>
        </form>

        <div class="acciones-ficha">
          ${l.formatos.includes('impreso') && l.stock > 0 ? `<a class="enlace-accion" href="#/personalizar?libro=${id}">${icono('chispa')} Personalizar como regalo</a>` : ''}
          <button class="enlace-accion" data-action="escuchar" data-texto="${esc(`${l.titulo}, de ${l.autor}. ${l.descripcion}`)}">${icono('volumen')} Escuchar descripción</button>
          ${l.stock <= 0 ? `<button class="enlace-accion" data-action="avisame" data-id="${id}">${icono('campana')} Avísame cuando llegue</button>` : ''}
        </div>

        <h2>Descripción</h2>
        <p class="ficha__desc">${esc(l.descripcion)}</p>

        <h2>Muestra</h2>
        ${texto ? `<p>Lee el comienzo del libro en el lector digital, con letra ajustable, lectura en voz alta y ayuda de la IA de lectura.</p><a class="btn" href="#/leer/${id}">${icono('libro')} Leer la muestra</a>`
          : `<p class="tenue">${l.dominioPublico ? 'La muestra de este libro está en preparación.' : 'La vista previa depende de la licencia de la editorial y todavía no está disponible para este libro.'}</p>`}

        <h2>Detalles</h2>
        <dl class="detalles">
          <div><dt>Autor</dt><dd>${esc(l.autor)}</dd></div>
          <div><dt>Primera edición</dt><dd>${l.anio}</dd></div>
          <div><dt>Páginas</dt><dd>${l.paginas}</dd></div>
          <div><dt>Idioma</dt><dd>${l.idioma}</dd></div>
          <div><dt>Categoría</dt><dd><a href="#/categoria/${cat.id}">${cat.nombre}</a></dd></div>
          <div><dt>Derechos</dt><dd>${l.dominioPublico ? 'Dominio público' : 'Con derechos de autor vigentes'}</dd></div>
        </dl>
      </div>
    </article>

    <section class="bloque resenas" id="resenas" tabindex="-1" aria-labelledby="t-resenas">
      <h2 id="t-resenas">Reseñas</h2>
      ${resenas.length ? `<ul class="lista-resenas">${resenas.map(r => `<li><p class="resena__cab">${LC.estrellas(r.nota)} <strong>${esc(r.nombre)}</strong> <span class="tenue">${LC.fecha(r.fecha)}</span></p><p>${esc(r.texto)}</p></li>`).join('')}</ul>`
        : '<p>Nadie ha opinado sobre este libro todavía. Cuéntanos qué te pareció.</p>'}
      <form id="form-resena" class="form-resena">
        <h3>Escribe una reseña</h3>
        <fieldset class="calificar"><legend>Tu nota</legend>
          ${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="nota-${n}" name="nota" value="${n}" ${n === 5 ? 'checked' : ''}><label for="nota-${n}" title="${n} de 5">${icono('estrella')}<span class="sr">${n} de 5</span></label>`).join('')}
        </fieldset>
        <div class="campo"><label for="r-nombre">Nombre</label><input id="r-nombre" name="nombre" required maxlength="40" value="${esc(u ? u.nombre : '')}"></div>
        <div class="campo"><label for="r-texto">Comentario</label><textarea id="r-texto" name="texto" rows="3" required maxlength="600"></textarea></div>
        <button class="btn">Publicar reseña</button>
      </form>
    </section>

    ${relacionados.length ? `<section class="bloque"><div class="bloque__cab"><h2>También en ${cat.nombre}</h2></div><div class="fila-libros">${relacionados.map(LC.tarjeta).join('')}</div></section>` : ''}`);

    const form = $('#form-compra');
    form.addEventListener('change', () => {
      $('#campo-cantidad').hidden = new FormData(form).get('formato') === 'digital';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const r = LC.agregarAlCarrito(id, fd.get('formato'), Math.max(1, parseInt(fd.get('cantidad') || '1', 10)));
      LC.toast(r.msg, r.ok ? 'ok' : 'error');
    });
    $('#form-resena').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const todas = LC.leer('resenas', {});
      (todas[id] = todas[id] || []).unshift({ nombre: fd.get('nombre').trim(), texto: fd.get('texto').trim(), nota: +fd.get('nota'), fecha: new Date().toISOString() });
      LC.guardar('resenas', todas);
      LC.toast('Reseña publicada. Gracias por compartirla.');
      LC.refrescar();
    });
  };

  A['ir-a'] = b => {
    const el = document.getElementById(b.dataset.destino);
    if (el) { el.scrollIntoView({ behavior: LC.prefs().movimiento ? 'auto' : 'smooth' }); el.focus({ preventScroll: true }); }
  };

  /* ============ 10. Carrito ============ */
  const PERSO = {
    dedicatoria: { nombre: 'Dedicatoria escrita a mano', precio: 1990 },
    exlibris: { nombre: 'Ex libris', precio: 2490 },
    envolturas: { ninguna: { nombre: 'Sin envoltura', precio: 0 }, kraft: { nombre: 'Papel kraft con cordel', precio: 1490 }, tela: { nombre: 'Bolsa de tela reutilizable', precio: 2990 } },
  };
  LC.PERSO = PERSO;
  const resumenPerso = p => [
    p.dedicatoria ? `Dedicatoria: «${esc(p.dedicatoria)}»` : '',
    p.exlibris ? `Ex libris a nombre de ${esc(p.exlibris.nombre)}` : '',
    p.envoltura && p.envoltura !== 'ninguna' ? PERSO.envolturas[p.envoltura].nombre : '',
  ].filter(Boolean).join('. ');
  LC.resumenPerso = resumenPerso;

  /* Sirve para el carrito, el pago y los pedidos ya creados (donde el cupón se guarda como texto). */
  LC.filasTotales = (t, enCarrito = false) => {
    const codigo = typeof t.cupon === 'string' ? t.cupon : t.cupon && t.cupon.codigo;
    const soloDigital = t.soloDigital ?? t.entrega === 'digital';
    const envioGratis = t.subtotal >= LC.CONFIG.envio.gratisDesde || (t.cupon && t.cupon.tipo === 'envio');
    const envio = enCarrito ? (envioGratis ? 'Gratis' : 'Se calcula en el pago') : (t.envio ? clp(t.envio) : 'Gratis');
    return `<dl class="totales">
      <div><dt>Subtotal</dt><dd>${clp(t.subtotal)}</dd></div>
      ${t.descuento ? `<div class="totales__descuento"><dt>Descuento${codigo ? ` (${esc(codigo)})` : ''}</dt><dd>−${clp(t.descuento)}</dd></div>` : ''}
      <div><dt>${soloDigital ? 'Entrega' : 'Envío'}</dt><dd>${soloDigital ? 'Digital' : envio}</dd></div>
      <div class="totales__total"><dt>Total</dt><dd>${clp(t.total)}</dd></div>
    </dl>`;
  };

  V.carrito = () => {
    const t = LC.totales();
    if (!t.carro.length) {
      return pintar('Carrito', `${encabezado('Carrito')}<div class="vacio"><p>Tu carrito está vacío. Agrega libros desde el catálogo o revisa las ofertas de la semana.</p>
        <div class="fila-botones"><a class="btn btn--primario" href="#/catalogo">Explorar el catálogo</a><a class="btn" href="#/ofertas">Ver ofertas</a></div></div>`);
    }
    const faltaGratis = LC.CONFIG.envio.gratisDesde - t.subtotal;
    pintar('Carrito', `${encabezado('Carrito', plural(t.cantidad, 'libro', 'libros'))}
    <div class="dos-columnas">
      <ul class="lista-carrito">${t.carro.map(i => {
        const l = LC.libro(i.id);
        const unitario = LC.precio(l, i.formato) + (i.extra || 0);
        const max = l.limitada ? 1 : l.stock;
        return `<li class="item-carrito">
          <a href="#/libro/${l.id}" tabindex="-1" aria-hidden="true">${LC.portada(l, 'portada--mini')}</a>
          <div class="item-carrito__info">
            <h2 class="item-carrito__titulo"><a href="#/libro/${l.id}">${esc(l.titulo)}</a></h2>
            <p class="tenue">${esc(l.autor)}. ${i.formato === 'digital' ? 'Digital' : 'Impreso'}${i.extra ? `, personalizado (+${clp(i.extra)})` : ''}</p>
            ${i.perso ? `<p class="perso-resumen">${resumenPerso(i.perso)}</p>` : ''}
            ${i.formato === 'impreso' ? `<div class="cantidad" role="group" aria-label="Cantidad de ${esc(l.titulo)}">
              <button class="btn-icono" data-action="cantidad" data-key="${i.key}" data-delta="-1" aria-label="Quitar un ejemplar" ${i.qty <= 1 ? 'disabled' : ''}>−</button>
              <span>${i.qty}</span>
              <button class="btn-icono" data-action="cantidad" data-key="${i.key}" data-delta="1" aria-label="Agregar un ejemplar" ${i.qty >= max ? 'disabled' : ''}>+</button>
            </div>` : ''}
          </div>
          <div class="item-carrito__precio">
            <strong>${clp(unitario * i.qty)}</strong>
            <button class="enlace-accion" data-action="quitar" data-key="${i.key}">${icono('basura')} Quitar</button>
          </div>
        </li>`;
      }).join('')}</ul>
      <aside class="resumen" aria-labelledby="t-resumen">
        <h2 id="t-resumen">Resumen</h2>
        <form id="form-cupon" class="cupon">
          <label for="cupon">Cupón de descuento</label>
          <div class="fila-input"><input id="cupon" autocomplete="off" value="${t.cupon ? t.cupon.codigo : ''}" placeholder="Por ejemplo CALAMA10"><button class="btn btn--chico">Aplicar</button></div>
        </form>
        ${t.cupon ? `<p class="cupon-activo">${icono('check')} <span>${t.cupon.codigo}: ${t.cupon.desc}</span> <button class="enlace-accion" data-action="quitar-cupon">Quitar</button></p>` : ''}
        ${t.avisoCupon ? `<p class="aviso">${t.avisoCupon}</p>` : ''}
        ${LC.filasTotales(t, true)}
        <a class="btn btn--primario btn--ancho" href="#/pago">Continuar al pago</a>
        ${!t.soloDigital && faltaGratis > 0 ? `<p class="tenue chico">Te faltan ${clp(faltaGratis)} para el despacho gratis.</p>` : ''}
      </aside>
    </div>`);
    $('#form-cupon').addEventListener('submit', e => {
      e.preventDefault();
      const codigo = $('#cupon').value.trim().toUpperCase();
      if (!codigo) return;
      const c = LC.cupones().find(x => x.codigo === codigo);
      if (!c) { LC.toast(`El cupón ${codigo} no existe o ya no está vigente. Revisa los cupones en Ofertas.`, 'error'); return; }
      LC.guardar('cupon', c.codigo);
      LC.toast(`Cupón ${c.codigo} aplicado.`);
      LC.refrescar();
    });
  };

  A.cantidad = b => {
    const item = LC.carrito().find(i => i.key === b.dataset.key);
    if (!item) return;
    LC.cambiarCantidad(b.dataset.key, item.qty + Number(b.dataset.delta));
    LC.refrescar();
    const mismo = $(`[data-action="cantidad"][data-key="${b.dataset.key}"][data-delta="${b.dataset.delta}"]`);
    const otro = $(`[data-action="cantidad"][data-key="${b.dataset.key}"]:not([disabled])`);
    (mismo && !mismo.disabled ? mismo : otro)?.focus();
  };
  A.quitar = b => { LC.quitarDelCarrito(b.dataset.key); LC.toast('Libro quitado del carrito.'); LC.refrescar(); };
  A['quitar-cupon'] = () => { LC.guardar('cupon', null); LC.toast('Cupón quitado.'); LC.refrescar(); };

  /* ============ 11 y 12. Pago tradicional y confirmación biométrica ============ */
  const REGIONES = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes y la Antártica Chilena'];
  const luhn = num => {
    const d = num.replace(/\D/g, '');
    if (d.length < 13 || d.length > 19) return false;
    let s = 0;
    for (let i = 0; i < d.length; i++) { let n = +d[d.length - 1 - i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } s += n; }
    return s % 10 === 0;
  };
  const campo = (id, etiqueta, attrs = '', ayuda = '') => `<div class="campo"><label for="${id}">${etiqueta}</label><input id="${id}" name="${id}" ${attrs} aria-describedby="${id}-error${ayuda ? ` ${id}-ayuda` : ''}">${ayuda ? `<small class="tenue" id="${id}-ayuda">${ayuda}</small>` : ''}<small class="error" id="${id}-error"></small></div>`;
  LC.campo = campo;

  V.pago = () => {
    const t0 = LC.totales();
    if (!t0.carro.length) { location.hash = '#/carrito'; return; }
    const u = LC.usuario() || {};
    const n = t0.soloDigital ? 2 : 3;
    pintar('Pago', `
    <nav class="migas" aria-label="Ruta"><a href="#/carrito">Carrito</a></nav>
    ${encabezado('Pago')}
    <p class="aviso aviso--demo">Modo demostración: no se realiza ningún cobro. Para cobrar de verdad hay que conectar la pasarela (Webpay, Mercado Pago o Flow) desde el servidor.</p>
    <form id="form-pago" class="dos-columnas" novalidate>
      <div class="pasos">
        <fieldset class="paso"><legend><span class="paso__n">1</span> Tus datos</legend>
          <div class="grid-campos">
            ${campo('nombre', 'Nombre y apellido', `autocomplete="name" required value="${esc(u.nombre || '')}"`)}
            ${campo('email', 'Correo electrónico', `type="email" autocomplete="email" required value="${esc(u.email || '')}"`)}
            ${campo('telefono', 'Teléfono', `type="tel" autocomplete="tel" value="${esc(u.telefono || '')}" placeholder="+56 9 1234 5678"`)}
          </div>
        </fieldset>
        ${t0.soloDigital ? '<p class="aviso">Tu compra es solo digital: los libros aparecen en tu biblioteca apenas se confirma el pago.</p>' : `
        <fieldset class="paso"><legend><span class="paso__n">2</span> Entrega</legend>
          <label class="opcion"><input type="radio" name="entrega" value="retiro" checked><span class="opcion__cuerpo"><span class="opcion__titulo">Retiro en tienda, Calama</span><span>Gratis</span><small>Te avisamos cuando esté listo, normalmente el mismo día.</small></span></label>
          <label class="opcion"><input type="radio" name="entrega" value="calama"><span class="opcion__cuerpo"><span class="opcion__titulo">Despacho dentro de Calama</span><span>${clp(LC.CONFIG.envio.calama)}</span><small>Entre 24 y 48 horas.</small></span></label>
          <label class="opcion"><input type="radio" name="entrega" value="chile"><span class="opcion__cuerpo"><span class="opcion__titulo">Despacho al resto de Chile</span><span>${clp(LC.CONFIG.envio.chile)}</span><small>De 3 a 6 días hábiles con Chilexpress o Starken.</small></span></label>
          <div class="grid-campos" id="direccion" hidden>
            ${campo('calle', 'Dirección', `autocomplete="street-address" value="${esc(u.direccion || '')}"`)}
            ${campo('comuna', 'Comuna', `autocomplete="address-level2" value="${esc(u.comuna || 'Calama')}"`)}
            <div class="campo"><label for="region">Región</label><select id="region" name="region">${REGIONES.map(r => `<option ${r === (u.region || 'Antofagasta') ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
          </div>
        </fieldset>`}
        <fieldset class="paso"><legend><span class="paso__n">${n}</span> Pago</legend>
          <label class="opcion"><input type="radio" name="metodo" value="tarjeta" checked><span class="opcion__cuerpo"><span class="opcion__titulo">Tarjeta de crédito o débito</span><small>Procesado por Webpay.</small></span></label>
          <label class="opcion"><input type="radio" name="metodo" value="transferencia"><span class="opcion__cuerpo"><span class="opcion__titulo">Transferencia bancaria</span><small>Preparamos el pedido cuando se confirme el depósito.</small></span></label>
          <label class="opcion"><input type="radio" name="metodo" value="mercadopago"><span class="opcion__cuerpo"><span class="opcion__titulo">Mercado Pago</span><small>Pagas con tu cuenta de Mercado Pago.</small></span></label>
          <label class="opcion"><input type="radio" name="metodo" value="biometria"><span class="opcion__cuerpo"><span class="opcion__titulo">${icono('huella')} Confirmar con huella o rostro</span><small>Usa el sensor de tu propio teléfono o computador (passkey).</small></span></label>

          <div data-metodo="tarjeta" class="grid-campos">
            ${campo('tarjeta', 'Número de tarjeta', 'inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="23"', 'Para probar, usa 4242 4242 4242 4242.')}
            ${campo('vence', 'Vencimiento', 'inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5"')}
            ${campo('cvv', 'Código de seguridad', 'inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"')}
          </div>
          <div data-metodo="transferencia" hidden><p>Al confirmar te mostramos los datos de la cuenta. Tienes 48 horas para transferir.</p></div>
          <div data-metodo="mercadopago" hidden><p>Al confirmar se abriría Mercado Pago para completar el pago. En esta demostración el pago se aprueba de inmediato.</p></div>
          <div data-metodo="biometria" hidden>
            <p>Confirmas la compra con la huella o el rostro que ya usas para desbloquear tu dispositivo. La librería nunca recibe tu huella ni una imagen de tu cara: el dispositivo solo confirma que eres tú.</p>
            <p class="tenue chico">Esta opción reemplaza al pago por reconocimiento ocular, que exigía hardware especial y almacenar datos biométricos sensibles.</p>
          </div>
        </fieldset>
      </div>
      <aside class="resumen" aria-labelledby="t-resumen-pago">
        <h2 id="t-resumen-pago">Tu pedido</h2>
        <ul class="mini-items">${t0.carro.map(i => { const l = LC.libro(i.id); return `<li><span>${esc(l.titulo)} <span class="tenue">× ${i.qty}${i.formato === 'digital' ? ', digital' : ''}</span></span><span>${clp((LC.precio(l, i.formato) + (i.extra || 0)) * i.qty)}</span></li>`; }).join('')}</ul>
        <div id="totales-pago"></div>
        <button class="btn btn--primario btn--ancho" type="submit" id="btn-pagar"></button>
      </aside>
    </form>`);

    const form = $('#form-pago');
    const sincronizar = () => {
      const fd = new FormData(form);
      const entrega = fd.get('entrega') || 'retiro';
      const metodo = fd.get('metodo');
      const dir = $('#direccion');
      if (dir) dir.hidden = entrega === 'retiro';
      $$('[data-metodo]', form).forEach(d => { d.hidden = d.dataset.metodo !== metodo; });
      const t = LC.totales({ entrega });
      $('#totales-pago').innerHTML = LC.filasTotales(t);
      $('#btn-pagar').innerHTML = metodo === 'biometria' ? `${icono('huella')} Confirmar y pagar ${clp(t.total)}` : metodo === 'transferencia' ? `Confirmar pedido por ${clp(t.total)}` : `Pagar ${clp(t.total)}`;
    };
    form.addEventListener('change', sincronizar);
    form.addEventListener('input', e => {
      if (e.target.getAttribute('aria-invalid') !== 'true') return;
      e.target.setAttribute('aria-invalid', 'false');
      const err = $('#' + e.target.id + '-error');
      if (err) err.textContent = '';
    });
    sincronizar();

    const tarjeta = $('#tarjeta'), vence = $('#vence');
    tarjeta.addEventListener('input', () => { tarjeta.value = tarjeta.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})(?=.)/g, '$1 '); });
    vence.addEventListener('input', () => { const d = vence.value.replace(/\D/g, '').slice(0, 4); vence.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; });

    const marcarError = (id, msg) => {
      const el = $('#' + id), err = $('#' + id + '-error');
      if (!el) return;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg || '';
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const metodo = fd.get('metodo'), entrega = t0.soloDigital ? 'digital' : fd.get('entrega');
      const errores = {};
      if (!fd.get('nombre').trim()) errores.nombre = 'Escribe tu nombre.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fd.get('email'))) errores.email = 'Escribe un correo válido, por ejemplo nombre@correo.cl.';
      if (entrega === 'calama' || entrega === 'chile') {
        if (!(fd.get('calle') || '').trim()) errores.calle = 'Escribe la dirección de despacho.';
        if (!(fd.get('comuna') || '').trim()) errores.comuna = 'Escribe la comuna.';
      }
      if (metodo === 'tarjeta') {
        if (!luhn(fd.get('tarjeta'))) errores.tarjeta = 'El número de tarjeta no es válido. Revisa que esté completo.';
        const [mm, aa] = (fd.get('vence') || '').split('/').map(Number);
        const fin = mm && aa ? new Date(2000 + aa, mm, 0, 23, 59) : null;
        if (!fin || mm > 12 || fin < new Date()) errores.vence = 'Escribe un vencimiento futuro con el formato MM/AA.';
        if (!/^\d{3,4}$/.test(fd.get('cvv'))) errores.cvv = 'El código tiene 3 o 4 dígitos y está al reverso de la tarjeta.';
      }
      ['nombre', 'email', 'calle', 'comuna', 'tarjeta', 'vence', 'cvv'].forEach(id => marcarError(id, errores[id]));
      const primero = Object.keys(errores)[0];
      if (primero) { $('#' + primero).focus(); LC.toast('Revisa los campos marcados.', 'error'); return; }

      const btn = $('#btn-pagar');
      const t = LC.totales({ entrega });
      let detalle = '';
      if (metodo === 'biometria') {
        const r = await LC.biometria.confirmar(t.total);
        if (!r.ok) { LC.toast(r.msg || 'No se confirmó la compra.', 'error'); return; }
        detalle = r.metodo === 'webauthn' ? 'Passkey del dispositivo' : 'Biometría (simulada)';
      } else {
        btn.disabled = true;
        btn.textContent = 'Procesando el pago…';
        await new Promise(r => setTimeout(r, 1200));
        if (metodo === 'tarjeta') detalle = 'terminada en ' + fd.get('tarjeta').replace(/\D/g, '').slice(-4);
        if (metodo === 'transferencia') detalle = 'Transferencia pendiente';
        if (metodo === 'mercadopago') detalle = 'Mercado Pago';
      }
      const pedido = LC.crearPedido({
        cliente: { nombre: fd.get('nombre').trim(), email: fd.get('email').trim(), telefono: (fd.get('telefono') || '').trim() },
        entrega,
        direccion: entrega === 'calama' || entrega === 'chile' ? { calle: fd.get('calle'), comuna: fd.get('comuna'), region: fd.get('region') } : null,
        pago: { metodo, detalle },
      });
      location.hash = `#/pedido/${pedido.id}?nuevo=1`;
    });
  };

  /* ============ 13. Seguimiento de pedidos ============ */
  const NOMBRE_ENTREGA = { retiro: 'Retiro en tienda, Calama', calama: 'Despacho dentro de Calama', chile: 'Despacho al resto de Chile', digital: 'Entrega digital' };
  const NOMBRE_PAGO = { tarjeta: 'Tarjeta', transferencia: 'Transferencia', mercadopago: 'Mercado Pago', biometria: 'Huella o rostro' };

  V.pedidos = () => {
    const ps = LC.pedidos();
    pintar('Seguimiento de pedidos', `${encabezado('Seguimiento de pedidos', 'Revisa en qué etapa está cada compra.')}
      <form id="buscar-pedido" class="fila-input fila-input--buscar">
        <label class="sr" for="num-pedido">Número de pedido</label>
        <input id="num-pedido" placeholder="Número de pedido, por ejemplo LC-123456" autocomplete="off">
        <button class="btn">Buscar pedido</button>
      </form>
      ${ps.length ? `<ul class="lista-pedidos">${ps.map(p => `<li><a class="pedido-fila" href="#/pedido/${p.id}">
          <span><strong>${p.id}</strong><span class="tenue">${LC.fecha(p.fecha)}</span></span>
          <span>${plural(p.items.reduce((s, i) => s + i.qty, 0), 'libro', 'libros')}</span>
          <span class="estado estado--${p.estado === LC.estadosDe(p).length - 1 ? 'fin' : 'curso'}">${LC.estadosDe(p)[p.estado]}</span>
          <strong>${clp(p.total)}</strong></a></li>`).join('')}</ul>`
        : `<div class="vacio"><p>Todavía no tienes pedidos. Cuando compres, aquí verás cada etapa hasta que el libro llegue a tus manos.</p><a class="btn btn--primario" href="#/catalogo">Ver catálogo</a></div>`}
      <p class="tenue chico">Demostración: los pedidos avanzan de etapa cada ${LC.MINUTOS_POR_ESTADO} minutos. En producción el estado lo informa la API del courier.</p>`);
    $('#buscar-pedido').addEventListener('submit', e => {
      e.preventDefault();
      const id = $('#num-pedido').value.trim().toUpperCase();
      if (LC.pedido(id)) location.hash = '#/pedido/' + id;
      else LC.toast(`No encontramos el pedido ${id || 'indicado'}. Revisa el número en tu comprobante.`, 'error');
    });
  };

  V.pedido = ([id], q) => {
    const p = LC.pedido(id);
    if (!p) return V.noEncontrado();
    const estados = LC.estadosDe(p);
    const fechaDe = i => { const h = p.historial.find(x => x.estado === i); return h ? LC.fecha(h.fecha, true) : ''; };
    pintar(`Pedido ${p.id}`, `
      <nav class="migas" aria-label="Ruta"><a href="#/pedidos">Mis pedidos</a></nav>
      ${q.nuevo ? `<div class="exito" role="status">${icono('check')}<div><h2>Compra confirmada</h2><p>Guarda el número <strong>${p.id}</strong> para seguir tu pedido.${p.entrega === 'digital' ? ' Tus libros ya están en tu biblioteca.' : ''}</p></div></div>` : ''}
      ${encabezado(`Pedido ${p.id}`, `Realizado el ${LC.fecha(p.fecha)}.`)}
      <div class="dos-columnas">
        <div>
          <h2>Estado</h2>
          <ol class="linea-tiempo">${estados.map((e, i) => `<li class="${i < p.estado ? 'hecho' : i === p.estado ? 'actual' : ''}" ${i === p.estado ? 'aria-current="step"' : ''}>
              <span class="linea-tiempo__punto" aria-hidden="true">${i <= p.estado ? icono('check') : ''}</span>
              <span class="linea-tiempo__texto"><strong>${e}</strong><span class="tenue">${fechaDe(i)}</span></span></li>`).join('')}</ol>
          ${p.seguimiento ? `<p>${icono('camion')} Número de seguimiento: <strong>${p.seguimiento}</strong></p>` : ''}
          ${p.pago.metodo === 'transferencia' ? `<div class="aviso"><p><strong>Datos para transferir</strong></p><p>Los datos de la cuenta de la librería se configuran en el panel de administración. Monto: ${clp(p.total)}. Indica el número ${p.id} en el comentario.</p></div>` : ''}
          ${p.entrega === 'digital' || p.items.some(i => i.formato === 'digital') ? `<a class="btn" href="#/biblioteca">${icono('libro')} Ir a mi biblioteca</a>` : ''}
        </div>
        <aside class="resumen">
          <h2>Detalle</h2>
          <ul class="mini-items">${p.items.map(i => `<li><span>${esc(i.titulo)} <span class="tenue">× ${i.qty}${i.formato === 'digital' ? ', digital' : ''}</span>${i.perso ? `<span class="perso-resumen">${resumenPerso(i.perso)}</span>` : ''}</span><span>${clp(i.precio * i.qty)}</span></li>`).join('')}</ul>
          ${LC.filasTotales(p)}
          <dl class="detalles detalles--compacto">
            <div><dt>Entrega</dt><dd>${NOMBRE_ENTREGA[p.entrega]}${p.direccion ? `: ${esc(p.direccion.calle)}, ${esc(p.direccion.comuna)}` : ''}</dd></div>
            <div><dt>Pago</dt><dd>${NOMBRE_PAGO[p.pago.metodo]}${p.pago.detalle ? ` (${esc(p.pago.detalle)})` : ''}</dd></div>
            <div><dt>A nombre de</dt><dd>${esc(p.cliente.nombre)}</dd></div>
          </dl>
          <button class="btn btn--ancho" data-action="imprimir">Imprimir comprobante</button>
        </aside>
      </div>`);
  };
  A.imprimir = () => window.print();

  /* ============ 14. Descuentos ============ */
  V.ofertas = () => {
    const ofertas = LC.catalogo().filter(l => l.oferta > 0);
    const cupones = LC.cupones();
    pintar('Ofertas y descuentos', `${encabezado('Ofertas y descuentos', 'Libros rebajados esta semana y cupones para usar en el carrito.')}
      <section class="bloque bloque--primero" aria-labelledby="t-cupones">
        <h2 id="t-cupones">Cupones</h2>
        <ul class="cupones">${cupones.map(c => `<li class="cupon-ticket">
          <span class="cupon-ticket__codigo">${esc(c.codigo)}</span>
          <span class="cupon-ticket__desc">${esc(c.desc)}</span>
          <span class="fila-botones"><button class="btn btn--chico" data-action="aplicar-cupon" data-codigo="${esc(c.codigo)}">Aplicar al carrito</button><button class="enlace-accion" data-action="copiar" data-texto="${esc(c.codigo)}">Copiar código</button></span>
        </li>`).join('')}</ul>
        <p class="tenue chico">Se puede usar un cupón por compra. El despacho es gratis desde ${clp(LC.CONFIG.envio.gratisDesde)}.</p>
      </section>
      <section class="bloque" aria-labelledby="t-rebajados">
        <h2 id="t-rebajados">Libros rebajados</h2>
        ${ofertas.length ? `<div class="grilla-libros">${ofertas.map(LC.tarjeta).join('')}</div>` : '<p>No hay libros rebajados esta semana. Los cupones siguen vigentes.</p>'}
      </section>`);
  };
  A['aplicar-cupon'] = b => { LC.guardar('cupon', b.dataset.codigo); LC.toast(`Cupón ${b.dataset.codigo} aplicado. Lo verás en el carrito.`); };
  A.copiar = b => {
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.texto).then(() => LC.toast('Código copiado.'), () => LC.toast('No se pudo copiar. Selecciona el código y cópialo a mano.', 'error'));
  };

  /* ============ 15. Ediciones limitadas ============ */
  V.limitadas = () => {
    const ls = LC.catalogo().filter(l => l.limitada);
    pintar('Ediciones limitadas', `${encabezado('Ediciones limitadas', 'Tiradas cortas con ejemplares numerados. Se vende uno por persona y no se reimprimen.')}
      <ul class="limitadas">${ls.map(l => `<li class="limitada">
        <a href="#/libro/${l.id}" tabindex="-1" aria-hidden="true">${LC.portada(l, 'portada--grande')}</a>
        <div class="limitada__info">
          <h2><a href="#/libro/${l.id}">${esc(l.titulo)}</a></h2>
          <p class="tenue">${esc(l.autor)}</p>
          <p>${esc(l.limitada.detalle)}</p>
          <p class="limitada__precio">${LC.precioHTML(l)}</p>
          <p class="existencias"><progress max="${l.limitada.total}" value="${l.stock}" aria-label="Ejemplares disponibles"></progress>
            ${l.stock > 0 ? `Quedan ${l.stock} de ${l.limitada.total} ejemplares.` : `Agotada: se vendieron los ${l.limitada.total} ejemplares.`}</p>
          ${l.stock > 0 ? `<button class="btn btn--primario" data-action="agregar" data-id="${l.id}" data-formato="impreso">Reservar mi ejemplar</button>`
            : `<button class="btn" data-action="avisame" data-id="${l.id}">${icono('campana')} Avísame de la próxima edición</button>`}
        </div></li>`).join('')}</ul>`);
  };

  A.avisame = b => {
    const lista = LC.leer('avisosStock', []);
    if (!lista.includes(b.dataset.id)) { lista.push(b.dataset.id); LC.guardar('avisosStock', lista); }
    LC.toast('Listo. Te avisaremos en Notificaciones cuando vuelva a estar disponible.');
  };

  /* ============ 16. Personalización con IA ============ */
  const MOTIVOS = {
    cordillera: { nombre: 'Cordillera', svg: '<circle cx="134" cy="62" r="15" fill="currentColor" stroke="none" opacity=".35"/><path d="M24 142 64 80l20 28 32-52 60 86z"/><path d="M58 90l6-10 8 11M110 64l6-8 9 13"/>' },
    estrellas: { nombre: 'Cielo de Atacama', svg: '<path d="M118 46a26 26 0 1 0 26 36 22 22 0 1 1-26-36z" fill="currentColor" stroke="none" opacity=".35"/>' + [[40, 50], [62, 80], [52, 118], [88, 60], [150, 120], [96, 132], [130, 140], [76, 104], [160, 52]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 2.2 : 3.4}" fill="currentColor" stroke="none"/>`).join('') },
    flor: { nombre: 'Flor del desierto', svg: [0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="100" cy="70" rx="10" ry="22" transform="rotate(${a} 100 92)"/>`).join('') + '<circle cx="100" cy="92" r="7" fill="currentColor" stroke="none"/><path d="M100 120v26M100 136c-10-6-18-4-22 2M100 132c9-6 17-5 21 0"/>' },
    cobre: { nombre: 'Vetas de cobre', svg: '<path d="M24 66c26-18 46 18 76 0s50 18 76 0M24 98c26-18 46 18 76 0s50 18 76 0M24 130c26-18 46 18 76 0s50 18 76 0"/>' },
  };
  LC.exlibrisSVG = (nombre, motivo) => `<svg viewBox="0 0 200 240" class="exlibris" role="img" aria-label="Vista previa del ex libris de ${esc(nombre || 'quien recibe')}">
      <rect x="8" y="8" width="184" height="224" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="16" y="16" width="168" height="208" rx="2" fill="none" stroke="currentColor" stroke-width=".8"/>
      <g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${MOTIVOS[motivo].svg}</g>
      <text x="100" y="180" text-anchor="middle" font-style="italic" font-size="15" fill="currentColor" font-family="Literata, Georgia, serif">Ex libris</text>
      <text x="100" y="208" text-anchor="middle" font-size="19" font-weight="700" fill="currentColor" font-family="Literata, Georgia, serif">${esc((nombre || 'Tu nombre').slice(0, 22))}</text>
    </svg>`;

  const GUINO = { poesia: 'para leer en voz alta', ciencia: 'para mirar el cielo con otros ojos', infantil: 'para leer juntos antes de dormir', novela: 'para vivir otra vida por un rato', clasicos: 'para descubrir por qué se sigue leyendo', chilena: 'para leer nuestra propia historia', idiomas: 'para practicar inglés de a poco' };
  const OCASION = { cumpleanos: 'en tu cumpleaños', graduacion: 'por este logro', agradecimiento: 'como agradecimiento', navidad: 'en esta Navidad', ninguna: 'porque sí' };
  /* Generador local de dedicatorias. Si CONFIG.iaEndpoint está definido, se piden al servicio de IA. */
  const dedicatoriasLocales = ({ para, de, ocasion, tono, libro }) => {
    const p = para || 'ti', d = de ? `, ${de}` : '', t = libro.titulo, g = GUINO[libro.cat] || 'para que te acompañe', o = OCASION[ocasion];
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const plantillas = {
      calido: [
        `Para ${p}: ${o}, te regalo «${t}» ${g}. Que lo disfrutes tanto como yo disfruto tenerte cerca. Con cariño${d}.`,
        `${cap(p)}, ${o} quise darte algo que dure. Aquí va «${t}», ${g}. Un abrazo grande${d}.`,
        `Para ${p}, ${o}: ojalá este libro te encuentre en una tarde tranquila. Con todo mi cariño${d}.`,
      ],
      divertido: [
        `${cap(p)}: ${o} te regalo «${t}». Prometo no contarte el final. Con cariño (y spoilers guardados)${d}.`,
        `Para ${p}, ${o}. Instrucciones: abrir, leer, repetir. Garantía de por vida${d}.`,
        `${cap(p)}, este libro es ${g}. Si no te gusta, la culpa es del autor, no mía${d}.`,
      ],
      formal: [
        `Para ${p}, ${o}, con mis mejores deseos. Espero que «${t}» sea una buena compañía${d}.`,
        `Estimada persona, ${p}: reciba este ejemplar de «${t}» ${o}, con aprecio${d}.`,
        `A ${p}, ${o}, con sincero aprecio y el deseo de muchas buenas lecturas${d}.`,
      ],
      poetico: [
        `Para ${p}: que estas páginas sean un oasis en el desierto de los días. ${cap(o)}${d}.`,
        `${cap(p)}, en Calama el cielo es claro y las noches largas: buenas para leer «${t}». ${cap(o)}${d}.`,
        `Para ${p}, ${o}: un libro es una ventana; esta mira hacia donde tú quieras${d}.`,
      ],
    };
    return plantillas[tono] || plantillas.calido;
  };

  V.personalizar = (_, q) => {
    const libros = LC.catalogo().filter(l => l.formatos.includes('impreso') && l.stock > 0);
    const sel = q.libro && libros.some(l => l.id === q.libro) ? q.libro : libros[0].id;
    const u = LC.usuario() || {};
    pintar('Personalizar regalo', `${encabezado('Personaliza tu regalo', 'Agrega una dedicatoria escrita a mano, un ex libris con el nombre de quien lo recibe y envoltura de regalo.')}
    <form id="form-perso" class="dos-columnas">
      <div class="pasos">
        <div class="campo"><label for="p-libro">Libro</label><select id="p-libro" name="libro">${libros.map(l => `<option value="${l.id}" ${l.id === sel ? 'selected' : ''}>${esc(l.titulo)}, ${esc(l.autor)} (${clp(LC.precio(l))})</option>`).join('')}</select></div>
        <fieldset class="paso"><legend>Dedicatoria <span class="tenue">(${clp(PERSO.dedicatoria.precio)})</span></legend>
          <div class="grid-campos">
            <div class="campo"><label for="p-para">Para</label><input id="p-para" name="para" maxlength="30" placeholder="Nombre de quien recibe"></div>
            <div class="campo"><label for="p-de">De parte de</label><input id="p-de" name="de" maxlength="30" value="${esc(u.nombre || '')}"></div>
            <div class="campo"><label for="p-ocasion">Ocasión</label><select id="p-ocasion" name="ocasion"><option value="cumpleanos">Cumpleaños</option><option value="graduacion">Graduación</option><option value="agradecimiento">Agradecimiento</option><option value="navidad">Navidad</option><option value="ninguna">Sin ocasión especial</option></select></div>
            <div class="campo"><label for="p-tono">Tono</label><select id="p-tono" name="tono"><option value="calido">Cálido</option><option value="divertido">Divertido</option><option value="formal">Formal</option><option value="poetico">Poético</option></select></div>
          </div>
          <button type="button" class="btn" id="btn-proponer">${icono('chispa')} Proponer dedicatorias</button>
          <div id="propuestas" class="propuestas" aria-live="polite"></div>
          <div class="campo"><label for="p-texto">Texto de la dedicatoria</label>
            <textarea id="p-texto" name="texto" rows="4" maxlength="280" aria-describedby="p-texto-ayuda"></textarea>
            <small class="tenue" id="p-texto-ayuda">Hasta 280 caracteres. La escribimos a mano en la primera página. Déjalo en blanco si no quieres dedicatoria.</small></div>
        </fieldset>
        <fieldset class="paso"><legend>Ex libris <span class="tenue">(${clp(PERSO.exlibris.precio)})</span></legend>
          <label class="opcion-simple"><input type="checkbox" name="exlibris" checked> Agregar un ex libris impreso</label>
          <div class="campo"><label for="p-exnombre">Nombre en el ex libris</label><input id="p-exnombre" name="exnombre" maxlength="22"></div>
          <fieldset class="campo"><legend>Motivo</legend><div class="motivos">
            ${Object.entries(MOTIVOS).map(([k, m], i) => `<label class="motivo"><input type="radio" name="motivo" value="${k}" ${i === 0 ? 'checked' : ''}><span>${m.nombre}</span></label>`).join('')}
          </div></fieldset>
        </fieldset>
        <fieldset class="paso"><legend>Envoltura</legend>
          ${Object.entries(PERSO.envolturas).map(([k, e], i) => `<label class="opcion-simple"><input type="radio" name="envoltura" value="${k}" ${i === 0 ? 'checked' : ''}> ${e.nombre}${e.precio ? ` (${clp(e.precio)})` : ''}</label>`).join('')}
        </fieldset>
      </div>
      <aside class="resumen" aria-labelledby="t-vista">
        <h2 id="t-vista">Vista previa</h2>
        <div id="vista-exlibris" class="vista-exlibris"></div>
        <blockquote id="vista-dedicatoria" class="vista-dedicatoria"></blockquote>
        <dl class="totales" id="perso-totales"></dl>
        <button class="btn btn--primario btn--ancho" type="submit">Agregar al carrito</button>
      </aside>
    </form>`);

    const form = $('#form-perso');
    const datos = () => {
      const fd = new FormData(form);
      const libro = LC.libro(fd.get('libro'));
      const texto = fd.get('texto').trim();
      const ex = fd.get('exlibris') === 'on';
      const env = fd.get('envoltura');
      const extra = (texto ? PERSO.dedicatoria.precio : 0) + (ex ? PERSO.exlibris.precio : 0) + PERSO.envolturas[env].precio;
      return { fd, libro, texto, ex, env, extra, exnombre: fd.get('exnombre').trim() || fd.get('para').trim() };
    };
    const vista = () => {
      const d = datos();
      $('#vista-exlibris').innerHTML = d.ex ? LC.exlibrisSVG(d.exnombre, d.fd.get('motivo')) : '<p class="tenue">Sin ex libris.</p>';
      $('#vista-dedicatoria').textContent = d.texto || 'Sin dedicatoria.';
      $('#perso-totales').innerHTML = `<div><dt>Libro</dt><dd>${clp(LC.precio(d.libro))}</dd></div><div><dt>Personalización</dt><dd>${clp(d.extra)}</dd></div><div class="totales__total"><dt>Total</dt><dd>${clp(LC.precio(d.libro) + d.extra)}</dd></div>`;
    };
    form.addEventListener('input', vista);
    form.addEventListener('change', vista);
    vista();

    $('#btn-proponer').addEventListener('click', async () => {
      const d = datos();
      const zona = $('#propuestas');
      zona.innerHTML = '<p class="tenue">Escribiendo propuestas…</p>';
      const entrada = { para: d.fd.get('para').trim(), de: d.fd.get('de').trim(), ocasion: d.fd.get('ocasion'), tono: d.fd.get('tono'), libro: d.libro };
      let propuestas = null;
      const remota = await LC.ia.pedir('dedicatoria', { ...entrada, libro: { titulo: d.libro.titulo, autor: d.libro.autor } });
      if (remota) propuestas = remota.split('\n').filter(Boolean).slice(0, 3);
      if (!propuestas) { await new Promise(r => setTimeout(r, 500)); propuestas = dedicatoriasLocales(entrada); }
      zona.innerHTML = `<p class="tenue chico">Elige una y edítala a tu gusto.</p>` + propuestas.map(p => `<button type="button" class="propuesta">${esc(p)}</button>`).join('');
      $$('.propuesta', zona).forEach(b => b.addEventListener('click', () => {
        $('#p-texto').value = b.textContent.slice(0, 280);
        vista();
        $('#p-texto').focus();
      }));
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = datos();
      if (!d.texto && !d.ex && d.env === 'ninguna') { LC.toast('Elige al menos una personalización: dedicatoria, ex libris o envoltura.', 'error'); return; }
      const perso = { dedicatoria: d.texto || null, exlibris: d.ex ? { nombre: d.exnombre || 'Sin nombre', motivo: d.fd.get('motivo') } : null, envoltura: d.env, precio: d.extra };
      const r = LC.agregarAlCarrito(d.libro.id, 'impreso', 1, perso);
      LC.toast(r.ok ? `«${d.libro.titulo}» personalizado se agregó al carrito.` : r.msg, r.ok ? 'ok' : 'error');
      if (r.ok) location.hash = '#/carrito';
    });
  };

  /* ============ 22. Sobre nosotros ============ */
  V.nosotros = () => {
    const T = LC.TIENDA;
    const pendiente = Object.values(T).some(v => /por confirmar/.test(v));
    pintar('Sobre nosotros', `${encabezado('Sobre nosotros')}
    <div class="nosotros">
      <div class="prosa">
        <p class="entrada">Librería Calama es una librería independiente en pleno desierto de Atacama. Queremos que en Calama sea fácil encontrar un buen libro, encargarlo si no lo tenemos y conversar sobre él.</p>
        <h2>Qué hacemos</h2>
        <ul>
          <li>Vendemos libros impresos con retiro en tienda y despacho a todo Chile.</li>
          <li>Ofrecemos libros digitales y obras de dominio público para leer gratis.</li>
          <li>Organizamos clubes de lectura en la tienda y por videollamada.</li>
          <li>Hacemos encargos: si un libro no está en el catálogo, lo buscamos.</li>
        </ul>
        <h2>Leer sin barreras</h2>
        <p>Diseñamos el sitio para que cualquier persona pueda usarlo: navegación por voz, lectura en voz alta, videos en lengua de señas chilena, letra ajustable y colores de alto contraste. Si algo no te funciona, escríbenos y lo arreglamos.</p>
      </div>
      <aside class="visita" aria-labelledby="t-visita">
        <h2 id="t-visita">Visítanos</h2>
        <dl class="detalles detalles--compacto">
          <div><dt>Dirección</dt><dd>${esc(T.direccion)}, ${esc(T.ciudad)}</dd></div>
          <div><dt>Horario</dt><dd>${esc(T.horario)}</dd></div>
          <div><dt>Teléfono</dt><dd>${esc(T.telefono)}</dd></div>
          <div><dt>Correo</dt><dd>${esc(T.correo)}</dd></div>
        </dl>
        <iframe class="mapa" title="Mapa de Calama" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-68.975%2C-22.49%2C-68.88%2C-22.42&amp;layer=mapnik"></iframe>
        ${pendiente ? '<p class="tenue chico">Los datos de contacto se completan en js/data.js (LC.TIENDA).</p>' : ''}
      </aside>
    </div>`);
  };

  /* ============ Mapa de módulos (la tabla solicitada) ============ */
  const claseViabilidad = v => /reformular/i.test(v) ? 'rojo' : /avanzado|licencias|parcial/i.test(v) ? 'naranjo' : 'verde';
  V.modulos = () => {
    pintar('Módulos del proyecto', `${encabezado('Módulos del proyecto', 'Los 25 módulos solicitados, su viabilidad, su complejidad y dónde verlos funcionando en este sitio.')}
      <div class="tabla-envoltura" tabindex="0" role="region" aria-label="Tabla de módulos">
      <table class="tabla tabla--modulos">
        <thead><tr><th scope="col">Módulo</th><th scope="col">Viabilidad</th><th scope="col">Complejidad</th><th scope="col">Cómo quedó</th></tr></thead>
        <tbody>${LC.MODULOS.map(([nombre, viab, comp, ruta, como], i) => `<tr>
          <th scope="row"><a href="${ruta}">${i + 1}. ${nombre}</a></th>
          <td><span class="viabilidad viabilidad--${claseViabilidad(viab)}">${viab}</span></td>
          <td>${comp}</td>
          <td>${como}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="tenue chico">Los módulos que dependen de servicios externos (pasarela de pago, courier, IA, videollamadas sincronizadas) funcionan en modo demostración y tienen el punto de conexión listo.</p>`);
  };

  /* ============ 4, 6, 7 y 8. Accesibilidad ============ */
  V.accesibilidad = () => {
    pintar('Accesibilidad', `${encabezado('Accesibilidad', 'Todo lo que puedes ajustar para leer y comprar a tu manera.')}
    <div class="a11y-pagina">
      <section aria-labelledby="t-ajustes" class="a11y-pagina__ajustes">
        <h2 id="t-ajustes">Colores y letra</h2>
        ${LC.controlesA11y('pg')}
      </section>
      <div class="prosa">
        <section aria-labelledby="t-voz">
          <h2 id="t-voz">Navegación por voz</h2>
          <p>Funciona en Chrome y Edge. Pulsa el micrófono de la barra superior, o Alt + V, y di un comando. Si tu navegador no reconoce voz, puedes escribir el comando.</p>
          <table class="tabla">
            <thead><tr><th scope="col">Di</th><th scope="col">Para</th></tr></thead>
            <tbody>
              <tr><td>«Ir a ofertas», «abrir carrito», «ver mi biblioteca»</td><td>Cambiar de sección</td></tr>
              <tr><td>«Buscar Gabriela Mistral»</td><td>Buscar en el catálogo</td></tr>
              <tr><td>«Abrir Cosmos»</td><td>Ir a la ficha de un libro</td></tr>
              <tr><td>«Agregar al carrito»</td><td>Agregar el libro que estás viendo</td></tr>
              <tr><td>«Bajar», «subir», «volver»</td><td>Moverte por la página</td></tr>
              <tr><td>«Leer la página», «detener»</td><td>Escuchar el contenido o detenerlo</td></tr>
              <tr><td>«Modo oscuro», «alto contraste», «agrandar letra»</td><td>Cambiar la apariencia</td></tr>
              <tr><td>«Abrir asistente», «abrir intérprete»</td><td>Abrir las ventanas de ayuda</td></tr>
            </tbody>
          </table>
          <button class="btn" data-action="voz">${icono('mic')} Activar voz</button>
        </section>
        <section aria-labelledby="t-tts">
          <h2 id="t-tts">Lectura en voz alta</h2>
          <p>Escucha cualquier página del sitio, la descripción de un libro o el texto completo en el lector digital. La velocidad se ajusta en Colores y letra.</p>
          <button class="btn" data-action="leer-pagina">${icono('volumen')} Escuchar esta página</button>
        </section>
        <section aria-labelledby="t-lsch">
          <h2 id="t-lsch">Lengua de señas chilena</h2>
          <p>Cada sección del sitio tiene un video en LSCh grabado por intérpretes. Abre la ventana del intérprete con el botón de la mano, abajo a la izquierda: el video cambia cuando cambias de sección.</p>
          <p class="tenue">Usamos videos grabados por personas porque la traducción automática a lengua de señas todavía no es confiable.</p>
          <button class="btn" data-action="lsch">${icono('mano')} Abrir intérprete</button>
        </section>
        <section aria-labelledby="t-teclado">
          <h2 id="t-teclado">Teclado y lectores de pantalla</h2>
          <ul>
            <li>Tab y Shift + Tab recorren los controles; el foco siempre es visible.</li>
            <li>«/» lleva al buscador; Alt + V activa la voz; Alt + A abre Colores y letra; Esc cierra ventanas.</li>
            <li>Al cambiar de sección, el foco pasa al título de la página para que el lector de pantalla lo anuncie.</li>
            <li>Los avisos y cambios del carrito se anuncian sin mover el foco.</li>
          </ul>
        </section>
      </div>
    </div>`);
    LC.enlazarA11y($('.a11y-pagina__ajustes'));
  };

  V.noEncontrado = () => pintar('Página no encontrada', `${encabezado('No encontramos esta página', 'Puede que el enlace esté incompleto o que el libro ya no esté en el catálogo.')}
    <div class="fila-botones"><a class="btn btn--primario" href="#/">Ir al inicio</a><a class="btn" href="#/catalogo">Ver catálogo</a></div>`);
})();
