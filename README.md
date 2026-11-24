# Librería Calama

Sitio web de la librería con los 25 módulos solicitados. Es HTML, CSS y JavaScript sin dependencias ni instalación.

## Cómo abrirlo

- Doble clic en `index.html`, o
- Con servidor local (recomendado para probar huella o rostro con passkeys): `python -m http.server 8000` y abrir `http://localhost:8000`.

La página **Módulos** (`#/modulos`) muestra la tabla de los 25 módulos con un enlace a cada uno.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Cabecera, menú, paneles flotantes (asistente, intérprete LSCh, voz, colores) |
| `css/styles.css` | Estilos, temas claro, oscuro y alto contraste |
| `js/data.js` | **Datos editables**: catálogo, cupones, clubes, datos de la tienda, textos del lector |
| `js/store.js` | Carrito, cupones, pedidos y avisos (se guardan en `localStorage`) |
| `js/views.js` | Inicio, catálogo, ficha, carrito, pago, pedidos, ofertas, ediciones limitadas, personalización, nosotros, accesibilidad |
| `js/lectura.js` | Biblioteca digital, lector, IA de lectura, club con videollamada, idiomas |
| `js/cuenta.js` | Cuenta, administración y notificaciones |
| `js/features.js` | Voz, asistente, LSCh, passkeys y panel de colores |

## Qué funciona en modo demostración

Todo el sitio funciona en el navegador. Estas piezas necesitan un servicio externo para producción:

| Módulo | Hoy | Para producción |
|---|---|---|
| 11. Pago | Valida la tarjeta y simula el cobro | Integrar Webpay, Mercado Pago o Flow desde un servidor |
| 12. Pago biométrico | Passkey real en HTTPS o localhost; simulado en `file://` | El servidor genera y verifica el desafío WebAuthn |
| 13. Seguimiento | El estado avanza solo cada 2 minutos | API del courier (Chilexpress, Starken) |
| 5, 16 y 20. IA | Respuestas locales sobre el catálogo y los textos | Poner la URL de tu backend en `LC.CONFIG.iaEndpoint` (la clave de API va en el servidor, nunca en el navegador) |
| 19. Lectura grupal | Videollamada real con Jitsi Meet; chat y párrafo compartido entre pestañas | Servidor en tiempo real (WebSocket) para sincronizar a todo el club |
| 8. Lengua de señas | Ventana del intérprete por sección | Grabar los videos en `videos/lsch/<seccion>.mp4` con un intérprete certificado |
| 23 y 24. Admin y cuentas | Se guardan en este navegador | Base de datos y autenticación en el servidor |

## Datos que faltan

En `js/data.js` (`LC.TIENDA`) completa dirección, horario, teléfono y correo. Precios, existencias y descripciones del catálogo son de ejemplo.
