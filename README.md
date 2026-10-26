# Gestión de Residuos Sólidos · Municipalidad Provincial de Puno

Portal de la Gerencia de Gestión Integral de Residuos Sólidos (GGIRS):

- mapa y horarios de las 29 rutas de recolección, con su estado según la hora de Puno;
- guía de segregación NTP 900.058:2019;
- programa municipal de compostaje;
- campañas Sumaq Ayni;
- actualidad: las publicaciones de la página de Facebook de la gerencia, que llegan solas;
- notas de prensa;
- reportes vecinales de puntos críticos, con código de seguimiento;
- **panel de administración** (`/panel`): notas de prensa, textos de cada página, contenidos (carrusel, gerencia, colores, campañas, preguntas, filtro de Facebook), identidad, colores, tipografía e imágenes; usuarios con roles e historial de cambios.

## Puesta en marcha

```bash
npm install
npx playwright install chromium   # sólo para las pruebas E2E
npm run dev                        # http://localhost:3000 (panel en /panel)
```

En desarrollo no hace falta instalar una base de datos: sin `DATABASE_URL`, el panel usa **PGlite** (Postgres embebido) en `.data/pglite`. El primer administrador se crea solo si están `PANEL_ADMIN_EMAIL` y `PANEL_ADMIN_PASSWORD`; si no, la primera vez `/panel/ingresar` pide crearlo (con el código `PANEL_SETUP_TOKEN`, si está definido).

| Script                        | Qué hace                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| `npm run build` / `npm start` | Build de producción y servidor                                   |
| `npm run lint`                | ESLint (incluye reglas del React Compiler)                       |
| `npm run typecheck`           | Genera los tipos de rutas y corre `tsc`                          |
| `npm run test:e2e`            | Playwright en escritorio y móvil (funcionalidad + accesibilidad) |
| `npm run test:a11y`           | Sólo la auditoría axe WCAG 2.2 AA de todas las páginas           |
| `npm run audit`               | Lint, tipos, build y E2E en cadena                               |
| `npm run format`              | Prettier con orden de clases Tailwind                            |
| `npm run db:generate`         | Escribe la migración SQL tras cambiar un `server/schema.ts`      |

### Con Docker

```bash
cp .env.example .env              # y completa POSTGRES_PASSWORD, PANEL_ADMIN_EMAIL y PANEL_ADMIN_PASSWORD
docker compose up -d --build      # construye y levanta en http://localhost:3000 (panel en /panel)
docker compose logs -f web        # registros (p. ej. errores del token de Facebook)
docker compose down               # detener; los datos quedan en los volúmenes "datos" y "postgres"
```

| Archivo         | Qué hace                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Dockerfile`    | Tres etapas: dependencias, build y un runner mínimo (`output: "standalone"`, usuario sin privilegios, healthcheck). |
| `compose.yaml`  | Servicios `web` y `db` (PostgreSQL 17, sin puerto expuesto). Volúmenes `datos` (`/app/data`) y `postgres`.          |
| `.dockerignore` | Deja fuera `node_modules`, builds, pruebas y **todos los `.env`**: ningún secreto entra en la imagen.               |

- **Variables al construir** (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_MAP_TILES`, `NEXT_PUBLIC_MAP_ATTRIBUTION`): Next.js las incrusta en el código. Se pasan como `args` en `compose.yaml` o con `--build-arg`. Al publicar, `NEXT_PUBLIC_SITE_URL` debe ser el dominio real.
- **Variables al arrancar** (`FACEBOOK_PAGE_TOKEN` y demás): se leen de `.env.local` con `env_file`. Como la imagen se construye sin el token, `/actualidad` arranca con el aviso "Muy pronto…" y en menos de un minuto muestra las publicaciones.
- **Claves** (`.env`, que compose lee solo): `POSTGRES_PASSWORD` (obligatoria; sin ella compose no arranca) y el primer administrador: `PANEL_ADMIN_EMAIL` y `PANEL_ADMIN_PASSWORD` (y opcionalmente `PANEL_ADMIN_NAME`). Si la base no tiene usuarios, ese administrador se crea solo con la contraseña como temporal: al entrar hay que cambiarla. Después esas variables ya no se usan. Sin ellas, se crea a mano en `/panel/ingresar` con `PANEL_SETUP_TOKEN`.
- **Persistencia:** el panel (usuarios, identidad, imágenes, historial) vive en el volumen `postgres`; las imágenes subidas y los reportes, inscripciones y voluntarios (`createJsonStore`), en `datos`. Sobreviven a `docker compose down` y a una nueva versión de la imagen; `docker compose down -v` los borra.
- **Migraciones:** la imagen trae `drizzle/` y la web las aplica sola al conectarse a PostgreSQL.
- Si el puerto 3000 está ocupado (por ejemplo, por `npm run dev`): `PORT=3300 docker compose up -d`.

## Stack

- **Next.js 16.4** (App Router, Cache Components, Partial Prerendering, Server Actions) y **React 19.3** (`<ViewTransition>` para transiciones entre páginas).
- **Tailwind CSS 4** con los tokens del sitio en `src/app/globals.css`.
- **Motion** para animación y **Lenis** para el scroll suave. Ambos se desactivan con "reducir movimiento".
- **Leaflet** para los mapas, cargado sólo en el cliente y fuera del bundle inicial.
- **Zod** para validar formularios en el servidor.
- **Playwright** y **axe-core** para E2E y auditoría de accesibilidad.

## Arquitectura: monolito modular

```
src/
  app/                 Rutas de Next. Sólo componen módulos; no tienen lógica propia.
    (sitio)/           páginas públicas, con el marco del sitio (_componentes/site-chrome.tsx)
    panel/             panel de administración: ingresar y (app)/ con barra lateral
    medios/[file]/     sirve las imágenes subidas desde el panel
  proxy.ts             Devuelve 404 real para slugs inexistentes (ver "Notas").
  modules/
    routes/            29 rutas: datos, horarios en hora de Lima, búsqueda, mapas
      data/            inventario de rutas + geometría por calles (OSM/OSRM)
      domain/          tipos y lógica pura (schedule, search, geo, queries)
      ui/              componentes (cliente y servidor)
      index.ts         API pública del módulo
    segregation/       código de colores e índice "¿dónde va esto?"
    compost/           calculadora de impacto e inscripción (Server Action)
    campaigns/         calendario Sumaq Ayni e inscripción de voluntarios
    news/              notas de prensa (tabla propia, borrador/publicada, formato simple seguro)
    facebook/          publicaciones de Facebook (Graph API) para /actualidad y la portada
    reports/           asistente de reporte, tickets MPP-AAMM-XXXX y seguimiento
    faq/               preguntas frecuentes
    office/            la gerencia: líneas de trabajo, organigrama, cifras e índice de servicios
    home/              carrusel de portada
    auth/              usuarios, contraseñas (scrypt), sesiones, roles y permisos del panel
    audit/             historial de cambios del panel
    identity/          identidad editable: nombres, contacto, redes, paleta (con contraste WCAG) y tipografía
    media/             biblioteca de imágenes y espacios de imagen del sitio
    content/           colecciones editables (documento JSON por clave, con versión) y su editor genérico
    copy/              textos editables por página: registro con los valores de fábrica y editor
  shared/
    config/            datos institucionales, navegación y mapa base
    content/           registro de imágenes con créditos y cifras con fuente
    layout/            header, footer, marca
    motion/            primitivas de animación (LineReveal, ImageReveal, Counter…)
    server/            base de datos (db.ts), almacén JSON y utilidades de formularios (server-only)
    ui/                botones, secciones, acordeón, campos, íconos
```

Reglas de dependencia:

1. Las páginas importan de `@/modules/<módulo>` (su `index.ts`) y de `@/shared`.
2. Un módulo no importa los internos de otro módulo.
3. Los Client Components importan sólo de `domain/` (código puro). Así los datos completos y Zod no viajan al navegador. El servidor prepara una vista recortada para el planificador de rutas (`plannerView`).
4. Todo lo que toca disco o datos sensibles vive en `server/` e importa `server-only`.

### Persistencia

**Panel:** PostgreSQL con [Drizzle](https://orm.drizzle.team). `src/shared/server/db.ts` abre la conexión (Postgres con `DATABASE_URL`, PGlite sin ella) y aplica las migraciones de `drizzle/`. Cada módulo define sus tablas en `server/schema.ts`; tras cambiarlas, `npm run db:generate` escribe la migración.

**Formularios del público:** `createJsonStore` (en `src/shared/server/json-store.ts`) guarda reportes, inscripciones y voluntarios en `.data/`. Si el disco es de sólo lectura, como en una plataforma serverless, trabaja en memoria. Para producción hay que reemplazarlo por un repositorio con base de datos que tenga la misma interfaz (`all`, `get`, `insert`). Ningún otro archivo necesita cambiar.

## Panel de administración (CMS)

En `/panel`. Cambia notas, textos, contenidos, identidad e imágenes sin tocar código; el sitio público sigue precalculado.

| Sección             | Qué se edita                                                                                                  | Dónde vive                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Notas de prensa     | Notas con borrador/publicada, foto, fuente y cuerpo con formato simple (negrita, subtítulos, listas, enlaces) | tabla `news_articles` (etiqueta `news`)  |
| Textos              | ~200 titulares, entradillas, botones y párrafos de 11 páginas, con "Restaurar" por campo                      | `content_docs`, clave `copy.<página>`    |
| Contenidos          | Carrusel, servicios, titular, subgerencias, líneas, cifras, colores, objetos, campañas, preguntas, filtro FB  | `content_docs`, una clave por colección  |
| Identidad y colores | Nombres, contacto, redes, paleta y tipografía                                                                 | `site_settings` (etiqueta `identity`)    |
| Imágenes            | Foto de cada espacio del sitio y biblioteca                                                                   | `media_assets` / `media_slots` (`media`) |

- **Cómo llega al sitio:** los valores de fábrica siguen en el código (`site.ts`, `media.ts`, `globals.css`, los `domain/content.ts` de cada módulo y `copy/pages/`) y la base solo guarda lo editado. Las lecturas quedan en caché (`"use cache"` con las etiquetas `identity`, `media`, `news` y `content:<clave>`); al publicar, la acción llama a `updateTag` y la próxima visita ya ve el cambio. Si la base no responde, el sitio sigue con los valores de fábrica.
- **Colecciones (`content`):** cada módulo define el esquema Zod, la vista del editor y sus datos de fábrica; `app/panel/(app)/contenidos/colecciones.ts` las junta. Se publica la colección entera con su versión: si otra persona publicó en el medio, se rechaza en vez de pisarla. Si un documento guardado deja de cumplir el esquema (porque cambió el código), el sitio usa los de fábrica y el editor lo avisa.
- **Textos (`copy`):** cada página declara sus textos en `src/modules/copy/pages/` y los lee con `getPageCopy("<página>")`; el título de la pestaña y la descripción salen de `getPageMetadata`. Se guardan solo los que difieren del original y cada uno se valida por separado (largo máximo, no vacío). Para agregar un texto editable: súmalo a la definición de la página y úsalo como `t.seccion.campo`.
- **Notas de prensa:** las 7 iniciales se copian a la base una sola vez (migración `0002_sembrar_noticias`). El cuerpo se convierte en datos (no en HTML), así que no admite etiquetas ni scripts; solo enlaces `http(s)`, `/` o `mailto:`. El proxy responde 404 a las direcciones inexistentes y a los borradores.
- **Imágenes en uso:** una imagen de la biblioteca usada en una colección no se puede borrar; si una nota apunta a una que ya no existe, se muestra una foto genérica del sitio.
- **Colores:** el layout raíz escribe en `:root` solo los tokens que difieren de fábrica (`ThemeStyle`); todas las utilidades de Tailwind leen `var(--color-*)`. Antes de publicar se validan 20 combinaciones reales con WCAG 2.2 AA (`identity/domain/contrast.ts`). Los cuatro colores de la NTP 900.058:2019 no se editan.
- **Tipografía:** cuatro fuentes cargadas con `next/font`; solo Kumbh Sans se precarga.
- **Imágenes:** cada clave de `MEDIA` es un espacio (`media/domain/slots.ts`). Al subir, la imagen se gira, se reduce a 2400 px, pasa a WebP y pierde sus metadatos (incluido el GPS). Se guarda en `DATA_DIR/media` y se sirve en `/medios/<uuid>.webp` con caché permanente.
- **Seguridad:**
  - contraseñas con scrypt;
  - sesión en cookie `httpOnly` y `Secure` (12 h), guardada como hash en la base;
  - bloqueo de 15 minutos tras 5 intentos fallidos;
  - cada acción del servidor vuelve a verificar el permiso;
  - el primer administrador sale de `PANEL_ADMIN_*` (contraseña temporal) o exige `PANEL_SETUP_TOKEN` en producción;
  - contraseña temporal obligatoria de cambiar;
  - desactivar una cuenta cierra sus sesiones.
- **Roles:** administrador (todo), editor de contenidos (notas, textos, contenidos, imágenes e historial) y fiscalizador (reservado para la etapa de reportes).

## Diseño

Sigue la identidad del portal oficial [portal.munipuno.gob.pe](https://portal.munipuno.gob.pe): es un sitio del Estado y debe reconocerse como tal a primera vista.

- **Estructura institucional:**
  - barra superior verde con Transparencia, la central, Serenazgo y las redes;
  - cabecera blanca con el escudo oficial 2025, el nombre de la Municipalidad y el de la gerencia;
  - pie de página verde con los datos de contacto y los enlaces del Estado.
- **Color (paleta "totora y lago"):** la gerencia es del área ambiental, así que la marca toma los verdes de la totora y los bosques de la ribera, y los fondos los celestes del Titicaca que se aclaran hacia el blanco.
  - verde bosque `#0D4A33` para bandas, titulares y pie; `#16704A` para textos y botones, porque cumple el contraste AA;
  - verde brote `#9FD356` sólo como acento sobre fondos oscuros;
  - celeste claro `#EEF8FA` y `#EBF8FC` para los fondos;
  - los nombres de token `puno-*` se mantienen: son "el color de marca", sea cual sea;
  - el amarillo del escudo (`#FFD900`) sólo marca el foco del teclado;
  - los cuatro colores de la NTP 900.058:2019 para la segregación.
- **Tipografía:** Kumbh Sans, la misma del portal municipal.
- **Fotografías reales:** las del sitio de referencia y las notas de prensa de la Municipalidad, más algunas fotos libres de Puno (con sus créditos en `/creditos`).
- **Inicio = presentación de la gerencia:**
  - carrusel con paisajes del Titicaca y el trabajo de campo;
  - quiénes somos, las cinco líneas de trabajo (pestañas con foto), un índice de servicios, cifras sobre el amanecer en los totorales, el organigrama con correos y la atención al vecino;
  - noticias y una banda para reportar.

  Cada servicio, incluido el mapa de rutas, tiene su página propia.

- **Movimiento:**
  - entradas suaves al hacer scroll;
  - titulares que emergen;
  - en el mapa, el recorrido se dibuja, el trazo "fluye" en el sentido de la ruta y un camión la recorre.

  Con "reducir movimiento" todo queda quieto y el carrusel no avanza solo.

## Contenido: qué es real y qué falta confirmar

**Verificado, con fuente en el sitio:**

- Las cifras del Estudio de Caracterización de Residuos de Puno 2015.
- El código de colores de la NTP 900.058:2019.
- La planta municipal de compostaje: más de 1 t diaria de orgánicos de mercados y el método Takakura. Viene de la nota de prensa de la Municipalidad sobre el mercado Unión y Dignidad, de 2025.
- Las notas sobre Cancharani (2024) e Itapalluni (2019).
- La dirección, la central telefónica y Serenazgo de la municipalidad.
- El organigrama de la GGIRS (gerente, subgerencias, correos y anexo 1060), del Directorio Municipal 2026.
- Las cifras de la portada: 100–110 t diarias y 60 % aprovechable (Subgerencia de Limpieza Pública, 2026), más de 2 t diarias de orgánicos de mercados y tres jornadas diarias de limpieza en el centro (notas de prensa de la Municipalidad).

**Heredado del sitio anterior, por confirmar con la GGIRS:**

- El inventario de las 29 rutas: horarios, calles y unidades.
- Los trazados del mapa:
  - **Rutas 1 a 9:** tienen el recorrido calle por calle del sitio de referencia (`trace: "detallado"`).
  - **Rutas 10 a 29:** sólo se conocen el inicio y el fin, unidos por OSRM (`trace: "referencial"`). Se dibujan con línea punteada y un aviso.
  - **Calles de las rutas 10 a 29:** casi ninguna existe en OpenStreetMap, así que hay que confirmarlas.
  - **Para completar:** cargar el GPS o el trazado de cada unidad en `src/modules/routes/data/routes.ts`.
- Las cifras de resultados de Sumaq Ayni: 15 t, 8 puntos críticos, 1 200 voluntarios y 3 campañas.
- Las fotos de inicio y fin de la ruta 01.
- El horario de atención.

**De ejemplo, a reemplazar:**

- El calendario de campañas Sumaq Ayni.
- Las noticias marcadas con `sample: true` en `src/modules/news/data.ts`.

## Notas de producción

- **Mapa base:**
  - Usa los mosaicos públicos de OpenStreetMap, que sólo admiten tráfico bajo.
  - Para producción, define `NEXT_PUBLIC_MAP_TILES` y `NEXT_PUBLIC_MAP_ATTRIBUTION` con un proveedor propio o contratado.
  - CARTO ya exige API key.
- **Estado de las rutas:** se calcula con el horario programado y la hora de Puno (`America/Lima`). Cuando exista GPS de la flota, el punto de integración es `routeState()` en `src/modules/routes/domain/schedule.ts`.
- **404 con Partial Prerendering:** el shell se envía antes de que la página pueda llamar a `notFound()`. Por eso `src/proxy.ts` rechaza los slugs desconocidos antes de renderizar.
- **Facebook (`/actualidad`):**
  - Copia `.env.example` como `.env.local` y pon en `FACEBOOK_PAGE_TOKEN` un token de **página** de larga duración con el permiso `pages_read_engagement`. Lo saca un administrador de la página en Meta for Developers.
  - El token sólo lo lee el servidor. Sin token, `/actualidad` muestra un aviso y la portada oculta el bloque.
  - Se consulta a Facebook como mucho una vez por hora (`cacheLife("hours")`). Si Facebook falla, se sigue mostrando la última respuesta buena y se reintenta en minutos.
  - Después de poner o cambiar el token hay que volver a hacer `npm run build`, porque la página se prerenderiza en el build.
  - Para que una publicación no salga en la web: escribe `#noweb` en su texto, o pega su enlace en `HIDDEN_POSTS` de `src/modules/facebook/config.ts`. `#web` se borra del texto visible. `SINCE` limita por fecha.
  - Un token de página deja de servir si cambia la contraseña del administrador o si le quitan el rol. Entonces hay que generar uno nuevo.
  - `npm run fb:token` revisa el token de `.env.local` y, si es de usuario, lo cambia por el de la página. El paso a paso está en `docs/vault/Operacion/facebook-token.md`.
- **Créditos fotográficos:** las fotos CC BY-SA se atribuyen en `/creditos`, enlazada desde el pie de página.
