/* Librería Calama — datos de ejemplo.
   Edita este archivo para cargar el catálogo real, los datos de la tienda y los cupones. */
window.LC = window.LC || {};

LC.CONFIG = {
  // URL de tu backend de IA (POST { tipo, ... } -> { texto }). Si es null, se usan respuestas locales de demostración.
  // Nunca pongas una clave de API en el navegador: el backend es quien llama al modelo.
  iaEndpoint: null,
  // Prefijo de las salas de videollamada del club (Jitsi Meet).
  salaPrefijo: 'LibreriaCalamaClub',
  envio: { retiro: 0, calama: 2990, chile: 4990, gratisDesde: 40000 },
};

LC.TIENDA = {
  nombre: 'Librería Calama',
  ciudad: 'Calama, Región de Antofagasta',
  direccion: 'Dirección por confirmar',
  horario: 'Horario por confirmar',
  telefono: 'Teléfono por confirmar',
  correo: 'Correo por confirmar',
};

LC.CATEGORIAS = [
  { id: 'chilena', nombre: 'Literatura chilena', desc: 'De Blest Gana a Mistral: autoras y autores de Chile.' },
  { id: 'clasicos', nombre: 'Clásicos', desc: 'Obras que se siguen leyendo siglos después.' },
  { id: 'novela', nombre: 'Novela', desc: 'Novela latinoamericana y del mundo.' },
  { id: 'poesia', nombre: 'Poesía', desc: 'Para leer despacio y en voz alta.' },
  { id: 'infantil', nombre: 'Infantil y juvenil', desc: 'Primeras lecturas y libros para crecer.' },
  { id: 'ciencia', nombre: 'Ciencia y astronomía', desc: 'Para mirar el cielo de Atacama con otros ojos.' },
  { id: 'idiomas', nombre: 'Idiomas', desc: 'Lecturas en inglés con traducción al tocar cada palabra.' },
];

/* Colores de portada: minerales y paisaje del desierto */
const C = {
  atacamita: ['#0E5B50', '#F3F1E8'], crisocola: ['#2E8F8A', '#FFFFFF'], cobre: ['#9C4A1C', '#FBEFE6'],
  lapislazuli: ['#23468C', '#F1F4FB'], salitre: ['#DCD6C4', '#2A2620'], azufre: ['#C9A227', '#231C05'],
  ciruela: ['#5A2A4F', '#F7ECF4'], basalto: ['#2D3436', '#E9ECEC'], flor: ['#9B2A6B', '#FFF0F7'],
  oxido: ['#7A3B1E', '#F8E9DF'], cielo: ['#1B2A4A', '#E8EEFF'], loa: ['#4F7A5A', '#F2F7F2'],
};
const col = k => ({ color: C[k][0], tinta: C[k][1] });

LC.LIBROS_BASE = [
  { id: 'quijote', titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', anio: 1605, cat: 'clasicos', precio: 18990, precioDigital: 0, oferta: 0, stock: 12, paginas: 1104, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: true, texto: 'quijote', nuevo: false, ...col('azufre'),
    descripcion: 'Un hidalgo de La Mancha lee tantos libros de caballerías que decide hacerse caballero andante. Junto a Sancho Panza recorre caminos, ventas y batallas que muchas veces solo existen en su cabeza.' },
  { id: 'rimas', titulo: 'Rimas', autor: 'Gustavo Adolfo Bécquer', anio: 1871, cat: 'poesia', precio: 8990, precioDigital: 0, oferta: 0, stock: 9, paginas: 176, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: true, texto: 'rimas', nuevo: false, ...col('ciruela'),
    descripcion: 'Poemas breves sobre el amor, la memoria y la propia poesía. Incluye la rima LIII, «Volverán las oscuras golondrinas».' },
  { id: 'quiroga', titulo: 'Cuentos de amor de locura y de muerte', autor: 'Horacio Quiroga', anio: 1917, cat: 'clasicos', precio: 11990, precioDigital: 0, oferta: 15, stock: 7, paginas: 208, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: true, texto: 'quiroga', nuevo: false, ...col('loa'),
    descripcion: 'Relatos donde el horror aparece en lo cotidiano, muchos ambientados en la selva de Misiones. Incluye «El almohadón de plumas».' },
  { id: 'alicia', titulo: "Alice's Adventures in Wonderland", autor: 'Lewis Carroll', anio: 1865, cat: 'idiomas', precio: 10990, precioDigital: 0, oferta: 0, stock: 6, paginas: 192, idioma: 'Inglés', formatos: ['impreso', 'digital'], dominioPublico: true, texto: 'alicia', nuevo: true, ...col('lapislazuli'),
    descripcion: 'Alicia sigue a un conejo blanco y cae en un mundo de lógica absurda. Edición en inglés: en la versión digital puedes tocar cada palabra para ver su traducción y guardarla en tu vocabulario.' },
  { id: 'azul', titulo: 'Azul...', autor: 'Rubén Darío', anio: 1888, cat: 'poesia', precio: 9990, precioDigital: 0, oferta: 0, stock: 5, paginas: 224, idioma: 'Español', formatos: ['impreso'], dominioPublico: true, nuevo: false, ...col('crisocola'),
    descripcion: 'Cuentos y poemas que Rubén Darío publicó en Valparaíso en 1888 y que marcaron el comienzo del modernismo.' },
  { id: 'desolacion', titulo: 'Desolación', autor: 'Gabriela Mistral', anio: 1922, cat: 'chilena', precio: 14990, oferta: 0, stock: 10, paginas: 248, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: false, ...col('salitre'),
    descripcion: 'El primer libro de Gabriela Mistral, publicado en Nueva York en 1922. Poemas sobre el dolor, la maternidad, la enseñanza y la tierra.' },
  { id: 'veinte-poemas', titulo: 'Veinte poemas de amor y una canción desesperada', autor: 'Pablo Neruda', anio: 1924, cat: 'chilena', precio: 12990, oferta: 10, stock: 14, paginas: 112, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: false, ...col('flor'),
    descripcion: 'El libro de poesía amorosa más leído en español, escrito por un Neruda que aún no cumplía veinte años.' },
  { id: 'casa-espiritus', titulo: 'La casa de los espíritus', autor: 'Isabel Allende', anio: 1982, cat: 'novela', precio: 19990, precioDigital: 11990, oferta: 0, stock: 8, paginas: 512, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: false, nuevo: true, ...col('oxido'),
    descripcion: 'La saga de la familia Trueba a lo largo de cuatro generaciones, entre lo mágico y la historia política de Chile.' },
  { id: 'hijo-ladron', titulo: 'Hijo de ladrón', autor: 'Manuel Rojas', anio: 1951, cat: 'chilena', precio: 15990, oferta: 0, stock: 4, paginas: 320, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: false, ...col('basalto'),
    descripcion: 'Aniceto Hevia recorre Argentina y Chile a la intemperie, entre cárceles, puertos y oficios. Una novela clave del siglo XX chileno.' },
  { id: 'cien-anos', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, cat: 'novela', precio: 21990, precioDigital: 12990, oferta: 20, stock: 11, paginas: 496, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: false, nuevo: false, ...col('cobre'),
    descripcion: 'La historia de los Buendía y del pueblo de Macondo, desde su fundación hasta su desaparición.' },
  { id: 'principito', titulo: 'El principito', autor: 'Antoine de Saint-Exupéry', anio: 1943, cat: 'infantil', precio: 9990, oferta: 0, stock: 20, paginas: 112, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: false, ...col('cielo'),
    descripcion: 'Un aviador perdido en el desierto conoce a un niño que viene de un asteroide. Un libro sobre lo que solo se ve con el corazón.' },
  { id: 'papelucho', titulo: 'Papelucho', autor: 'Marcela Paz', anio: 1947, cat: 'infantil', precio: 8990, oferta: 0, stock: 15, paginas: 104, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: false, ...col('azufre'),
    descripcion: 'El diario de un niño chileno de ocho años que lo cuenta todo con una lógica muy propia.' },
  { id: 'cosmos', titulo: 'Cosmos', autor: 'Carl Sagan', anio: 1980, cat: 'ciencia', precio: 22990, precioDigital: 13990, oferta: 0, stock: 6, paginas: 384, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: false, nuevo: true, ...col('cielo'),
    descripcion: 'Carl Sagan recorre la historia de la ciencia y del universo, desde la biblioteca de Alejandría hasta las sondas Voyager.' },
  { id: 'breve-historia', titulo: 'Breve historia del tiempo', autor: 'Stephen Hawking', anio: 1988, cat: 'ciencia', precio: 17990, precioDigital: 10990, oferta: 10, stock: 3, paginas: 256, idioma: 'Español', formatos: ['impreso', 'digital'], dominioPublico: false, nuevo: false, ...col('basalto'),
    descripcion: 'Del big bang a los agujeros negros, explicado por Stephen Hawking para quienes no tienen formación científica.' },
  { id: 'martin-rivas', titulo: 'Martín Rivas', autor: 'Alberto Blest Gana', anio: 1862, cat: 'chilena', precio: 10990, oferta: 0, stock: 9, paginas: 432, idioma: 'Español', formatos: ['impreso'], dominioPublico: true, nuevo: false, ...col('atacamita'),
    descripcion: 'Un joven de Copiapó llega a Santiago a vivir con una familia acomodada y se enamora de Leonor. Novela fundacional del realismo chileno.' },
  { id: 'subterra', titulo: 'Subterra', autor: 'Baldomero Lillo', anio: 1904, cat: 'chilena', precio: 34990, oferta: 0, stock: 41, paginas: 240, idioma: 'Español', formatos: ['impreso'], dominioPublico: true, nuevo: false, ...col('oxido'),
    limitada: { total: 300, detalle: 'Edición ilustrada, tapa dura cosida y ejemplares numerados a mano.' },
    descripcion: 'Cuentos sobre los mineros del carbón de Lota. Para una ciudad minera, un libro que se lee distinto.' },
  { id: 'altazor', titulo: 'Altazor', autor: 'Vicente Huidobro', anio: 1931, cat: 'poesia', precio: 39990, oferta: 0, stock: 18, paginas: 160, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: true, ...col('lapislazuli'),
    limitada: { total: 150, detalle: 'Tapa en tela azul, estampado en cobre y ejemplares numerados.' },
    descripcion: 'El poema mayor del creacionismo: un viaje en paracaídas a través del lenguaje.' },
  { id: 'desolacion-centenario', titulo: 'Desolación, edición centenario', autor: 'Gabriela Mistral', anio: 1922, cat: 'chilena', precio: 32990, oferta: 0, stock: 7, paginas: 280, idioma: 'Español', formatos: ['impreso'], dominioPublico: false, nuevo: false, ...col('atacamita'),
    limitada: { total: 100, detalle: 'Edición conmemorativa de los cien años del libro, con estuche y ejemplares numerados.' },
    descripcion: 'Edición conmemorativa del primer libro de Gabriela Mistral.' },
];

LC.CUPONES_BASE = [
  { codigo: 'CALAMA10', tipo: 'pct', valor: 10, minimo: 0, desc: '10 % de descuento en toda la compra.' },
  { codigo: 'LECTOR5000', tipo: 'monto', valor: 5000, minimo: 30000, desc: '$5.000 de descuento en compras desde $30.000.' },
  { codigo: 'ENVIOGRATIS', tipo: 'envio', valor: 0, minimo: 0, desc: 'Despacho gratis a cualquier comuna.' },
];

LC.CLUBES = [
  { id: 'clasicos', nombre: 'Club de clásicos', libro: 'quijote', cuando: 'Jueves, 19:00', desc: 'Leemos un capítulo por semana y lo comentamos en voz alta.' },
  { id: 'poesia', nombre: 'Poesía en voz alta', libro: 'rimas', cuando: 'Martes, 20:00', desc: 'Cada persona lee un poema y conversamos sobre él.' },
  { id: 'english', nombre: 'English book club', libro: 'alicia', cuando: 'Sábados, 11:00', desc: 'Práctica de inglés para nivel básico e intermedio, con lectura guiada.' },
  { id: 'cuentos', nombre: 'Cuentos de terror', libro: 'quiroga', cuando: 'Viernes, 21:00', desc: 'Un cuento por sesión, leído por turnos.' },
];

/* Textos de dominio público para el lector digital, con material de apoyo para la IA de lectura */
LC.TEXTOS = {
  quijote: {
    idioma: 'es',
    capitulos: [{ titulo: 'Capítulo primero', parrafos: [
      'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.',
      'Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.',
      'El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino.',
      'Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera.',
      'Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza.',
    ] }],
    ia: {
      resumen: 'El narrador presenta a un hidalgo pobre que vive en un pueblo de La Mancha cuyo nombre prefiere no decir. Describe lo que come durante la semana, cómo se viste, con quién vive (una ama, una sobrina y un mozo) y su aspecto: cerca de los cincuenta años, delgado, madrugador y aficionado a la caza.',
      preguntas: ['¿Por qué crees que el narrador no quiere nombrar el lugar?', '¿Qué dice la comida del hidalgo sobre su situación económica?', '¿Qué rasgos físicos y de carácter se mencionan del protagonista?'],
      glosario: { hidalgo: 'Persona de la nobleza baja, sin título.', 'lanza en astillero': 'Lanza guardada en su soporte: señal de un caballero que ya no la usa.', adarga: 'Escudo de cuero, de forma ovalada.', 'rocín': 'Caballo de mala traza y poco valor.', galgo: 'Perro de caza, delgado y muy veloz.', 'salpicón': 'Carne picada y fría, aderezada con cebolla y sal.', 'duelos y quebrantos': 'Plato de huevos con torreznos o chorizo.', lantejas: 'Forma antigua de «lentejas».', hacienda: 'Bienes y dinero de una persona.', velarte: 'Paño negro de buena calidad.', velludo: 'Terciopelo.', 'vellorí': 'Paño de lana de color pardo.', frisaba: 'Se acercaba a cierta edad.', enjuto: 'Delgado, seco de carnes.', podadera: 'Herramienta para podar.' },
    },
  },
  rimas: {
    idioma: 'es', verso: true,
    capitulos: [{ titulo: 'Rima LIII', parrafos: [
      'Volverán las oscuras golondrinas\nen tu balcón sus nidos a colgar,\ny otra vez con el ala a sus cristales\njugando llamarán.',
      'Pero aquellas que el vuelo refrenaban\ntu hermosura y mi dicha a contemplar,\naquellas que aprendieron nuestros nombres...\nésas... ¡no volverán!',
      'Volverán las tupidas madreselvas\nde tu jardín las tapias a escalar,\ny otra vez a la tarde aún más hermosas\nsus flores se abrirán.',
      'Pero aquellas cuajadas de rocío\ncuyas gotas mirábamos temblar\ny caer como lágrimas del día...\nésas... ¡no volverán!',
      'Volverán del amor en tus oídos\nlas palabras ardientes a sonar;\ntu corazón de su profundo sueño\ntal vez despertará.',
      'Pero mudo y absorto y de rodillas\ncomo se adora a Dios ante su altar,\ncomo yo te he querido...; desengáñate,\n¡así... no te querrán!',
    ] }],
    ia: {
      resumen: 'El poema contrapone lo que volverá (las golondrinas, las madreselvas, las palabras de amor) con lo que no volverá: los instantes compartidos y el amor del hablante. Cada par de estrofas repite la estructura «Volverán... / Pero... ¡no volverán!».',
      preguntas: ['¿Qué elementos de la naturaleza vuelven y cuáles no?', '¿A quién se dirige el hablante?', '¿Qué efecto produce la repetición de «volverán»?'],
      glosario: { golondrinas: 'Aves migratorias que vuelven cada primavera.', refrenaban: 'Detenían, contenían.', madreselvas: 'Plantas trepadoras de flores olorosas.', tapias: 'Muros de tierra que cercan un terreno.', cuajadas: 'Completamente cubiertas.', absorto: 'Concentrado, como fuera de sí.', 'desengáñate': 'Deja de engañarte; acepta la verdad.' },
    },
  },
  quiroga: {
    idioma: 'es',
    capitulos: [{ titulo: 'El almohadón de plumas', parrafos: [
      'Su luna de miel fue un largo escalofrío. Rubia, angelical y tímida, el carácter duro de su marido heló sus soñadas niñerías de novia.',
      'Ella lo quería mucho, sin embargo, a veces con un ligero estremecimiento cuando volviendo de noche juntos por la calle, echaba una furtiva mirada a la alta estatura de Jordán, mudo desde hacía una hora.',
      'Él, por su parte, la amaba profundamente, sin darlo a conocer.',
    ] }],
    ia: {
      resumen: 'Alicia y Jordán acaban de casarse. Ella es tímida y él tiene un carácter duro; se quieren, pero la relación empieza con una frialdad que la estremece y que anticipa el tono inquietante del cuento.',
      preguntas: ['¿Qué quiere decir que la luna de miel fue «un largo escalofrío»?', '¿Cómo se describe a Jordán?', '¿Qué sensación deja este comienzo?'],
      glosario: { 'escalofrío': 'Sensación de frío repentino, a menudo por miedo.', 'niñerías': 'Ilusiones o juegos propios de la niñez.', estremecimiento: 'Temblor breve causado por una emoción.', furtiva: 'Hecha a escondidas.' },
    },
  },
  alicia: {
    idioma: 'en',
    capitulos: [{ titulo: 'Chapter I. Down the Rabbit-Hole', parrafos: [
      'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”',
      'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
    ] }],
    traduccion: [
      'Alicia empezaba a cansarse mucho de estar sentada junto a su hermana en la orilla, sin nada que hacer: una o dos veces había echado un vistazo al libro que leía su hermana, pero no tenía dibujos ni diálogos, «¿y de qué sirve un libro», pensó Alicia, «sin dibujos ni diálogos?»',
      'Así que estaba pensando (lo mejor que podía, porque el calor la hacía sentirse muy dormida y torpe) si el placer de hacer una cadena de margaritas valdría la pena de levantarse a recogerlas, cuando de pronto un Conejo Blanco de ojos rosados pasó corriendo muy cerca de ella.',
    ],
    ia: {
      resumen: 'Alicia se aburre sentada junto a su hermana, que lee un libro sin dibujos ni diálogos. Mientras piensa si vale la pena hacer una cadena de margaritas, pasa corriendo a su lado un Conejo Blanco de ojos rosados.',
      preguntas: ['Why is Alice bored?', 'What does Alice think a good book needs?', 'What does the White Rabbit look like?'],
      glosario: {},
    },
  },
};

/* Diccionario inglés-español para el modo idiomas */
LC.DICCIONARIO = {
  alice: 'Alicia', was: 'estaba / era', beginning: 'comenzando', to: 'a / para', get: 'ponerse, conseguir', very: 'muy', tired: 'cansada', of: 'de', sitting: 'estar sentada', by: 'junto a', her: 'su / ella', sister: 'hermana', on: 'en / sobre', the: 'el, la, los, las', bank: 'orilla (de un río)', and: 'y', having: 'tener', nothing: 'nada', do: 'hacer', once: 'una vez', or: 'o', twice: 'dos veces', she: 'ella', had: 'había / tenía', peeped: 'echó un vistazo', into: 'dentro de', book: 'libro', reading: 'leyendo', but: 'pero', it: 'eso / lo', no: 'ningún / no', pictures: 'dibujos, ilustraciones', conversations: 'conversaciones, diálogos', in: 'en', what: 'qué', is: 'es', use: 'uso, utilidad', a: 'un / una', thought: 'pensó', without: 'sin', so: 'así que', considering: 'pensando, considerando', own: 'propia', mind: 'mente', as: 'como / tan', well: 'bien', could: 'podía', for: 'porque / para', hot: 'caluroso', day: 'día', made: 'hizo', feel: 'sentirse', sleepy: 'con sueño', stupid: 'torpe, tonta', whether: 'si (duda)', pleasure: 'placer', making: 'hacer', daisy: 'margarita', chain: 'cadena', 'daisy-chain': 'cadena de margaritas', would: '-ría (condicional)', be: 'ser / estar', worth: 'valer la pena', trouble: 'molestia', getting: 'levantarse (getting up)', up: 'arriba', picking: 'recoger', daisies: 'margaritas', when: 'cuando', suddenly: 'de repente', white: 'blanco', rabbit: 'conejo', with: 'con', pink: 'rosado', eyes: 'ojos', ran: 'corrió', close: 'cerca',
};

/* Los 25 módulos solicitados: viabilidad, complejidad y dónde está cada uno en el sitio */
LC.MODULOS = [
  ['Página de inicio', 'Normal', 'Baja', '#/', 'Portada con estante interactivo, novedades, ofertas y club.'],
  ['Catálogo de libros', 'Normal', 'Baja', '#/catalogo', 'Búsqueda, filtros por categoría, formato, precio y ofertas, y orden.'],
  ['Categorías de libros', 'Normal', 'Baja', '#/categorias', 'Siete categorías con su propio listado.'],
  ['Navegación por voz', 'Avanzado', 'Alta', '#/accesibilidad', 'Reconocimiento de voz del navegador (Chrome y Edge) con comandos en español.'],
  ['Asistente virtual con IA', 'Avanzado', 'Alta', '#/', 'Asistente que busca y recomienda libros. Funciona localmente y se conecta a un servicio de IA real en CONFIG.iaEndpoint.'],
  ['Personalización de colores', 'Normal', 'Baja', '#/accesibilidad', 'Temas claro, oscuro y alto contraste, más color principal a elección con contraste asegurado.'],
  ['Accesibilidad convencional', 'Normal', 'Media', '#/accesibilidad', 'Tamaño de letra, interlineado, letra para dislexia, lectura en voz alta, teclado y lectores de pantalla.'],
  ['Traducción de lenguaje de señas', 'Reformular', 'Extrema', '#/accesibilidad', 'Reformulado: ventana con videos en LSCh grabados por intérpretes, uno por sección, en vez de traducción automática.'],
  ['Ficha individual de libros', 'Parcialmente normal', 'Variable', '#/libro/quijote', 'Detalles, formatos, reseñas y muestra de lectura cuando la licencia lo permite.'],
  ['Carrito de compras', 'Normal', 'Baja', '#/carrito', 'Cantidades, personalizaciones y cupones; se guarda entre visitas.'],
  ['Compra y pago tradicional', 'Normal con pasarela', 'Media', '#/carrito', 'Pago con tarjeta, transferencia o Mercado Pago en modo demostración; listo para conectar la pasarela.'],
  ['Pago mediante reconocimiento ocular', 'Reformular', 'Extrema', '#/cuenta', 'Reformulado: confirmación biométrica con passkey (huella o rostro del propio dispositivo, WebAuthn).'],
  ['Seguimiento de pedidos', 'Normal con integración', 'Media', '#/pedidos', 'Línea de tiempo del pedido y número de seguimiento; en producción lo actualiza la API del courier.'],
  ['Descuentos', 'Normal', 'Baja', '#/ofertas', 'Precios rebajados y cupones de porcentaje, monto fijo y envío gratis.'],
  ['Ediciones limitadas', 'Normal', 'Baja', '#/limitadas', 'Ejemplares numerados con existencias visibles y reserva de uno por persona.'],
  ['Personalización de productos con IA', 'Avanzado', 'Alta', '#/personalizar', 'Generador de dedicatorias, ex libris y envoltura de regalo.'],
  ['Biblioteca digital', 'Viable con licencias', 'Media', '#/biblioteca', 'Libros digitales comprados y obras de dominio público gratuitas.'],
  ['Lector digital interactivo', 'Avanzado', 'Alta', '#/leer/quijote', 'Tamaño, tema y letra; subrayados, marcador, progreso y lectura en voz alta.'],
  ['Lectura grupal y videollamadas', 'Avanzado', 'Muy alta', '#/club', 'Clubes de lectura con sala de videollamada (Jitsi Meet), lectura compartida y chat.'],
  ['IA aplicada a la lectura', 'Avanzado con restricciones', 'Muy alta', '#/leer/quijote', 'Resumen, glosario, preguntas y explicación de pasajes, solo en obras cuya licencia lo permite.'],
  ['Aprendizaje de idiomas', 'Avanzado', 'Alta', '#/idiomas', 'Lectura en inglés con traducción al tocar, vocabulario propio y tarjetas de repaso.'],
  ['Sobre nosotros', 'Normal', 'Baja', '#/nosotros', 'Historia, propuesta y datos de contacto de la librería.'],
  ['Panel de administración', 'Normal', 'Media', '#/admin', 'Libros, precios, existencias, pedidos, cupones y avisos.'],
  ['Cuenta y perfil', 'Normal', 'Media', '#/cuenta', 'Registro, datos, preferencias, favoritos y passkey.'],
  ['Notificaciones', 'Normal', 'Media', '#/notificaciones', 'Centro de avisos de pedidos, ofertas y club; también notificaciones del navegador.'],
];
