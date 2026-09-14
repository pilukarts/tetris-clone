# Cosmic Blocks — Telegram Mini App

Una reinvención espacial y móvil del prototipo original. Esta versión sustituye el archivo Pygame incompleto por un juego web que puede ejecutarse dentro de Telegram.

## Incluido

- Juego completo de bloques: rotación, colisiones, pieza fantasma, caída rápida y siguiente pieza.
- Puntuación, niveles, líneas y récord local/Telegram CloudStorage.
- Controles táctiles y de teclado, vibración háptica y sonido sintetizado.
- Diseño responsive, safe areas, animaciones, partículas y tema espacial.
- Ruta galáctica con 12 misiones, objetivos de líneas/puntuación y desbloqueo progresivo.
- Espacios claramente marcados para patrocinio, anuncios recompensados, tienda con Stars y torneos.

## Probar localmente

```bash
python3 -m http.server 8080
```

Abre `http://localhost:8080`. La app también funciona fuera de Telegram con degradación progresiva.

## Publicar en Telegram

1. Hospeda estos archivos en una URL pública HTTPS (GitHub Pages, Cloudflare Pages, Vercel, etc.).
2. Crea un bot con [@BotFather](https://t.me/BotFather).
3. En **Bot Settings → Configure Mini App**, configura la URL HTTPS y los recursos visuales.
4. Valida siempre `Telegram.WebApp.initData` en el servidor antes de confiar en la identidad del usuario.

## Monetización: estado real

Los botones comerciales son puntos de integración, no pagos ni premios reales.

- **Stars:** los bienes digitales dentro de Telegram deben facturarse en Telegram Stars desde un backend/bot. No pongas el token del bot en `app.js`.
- **Anuncios recompensados:** conecta un proveedor compatible y concede recompensas solo después de verificar el evento en el servidor.
- **Torneos:** requieren cuentas validadas, tabla de clasificación en servidor, medidas anti-trampas, reglas públicas y revisión legal/fiscal antes de ofrecer premios.
- **Patrocinios:** reemplaza “TU MARCA AQUÍ” y enlaza una campaña identificada claramente como publicidad.

## Próxima fase recomendada

Crear un backend pequeño para validar Telegram, guardar puntuaciones firmadas, emitir facturas de Stars y administrar torneos. Nunca aceptes puntuaciones o datos de usuario enviados por el navegador sin validación.

## Controles

- `←` / `→`: mover
- `↑`: girar
- `↓`: bajar
- `Espacio`: caída rápida
- `P`: pausa

Proyecto bajo la licencia MIT existente.
