# Gestión de Residuos Sólidos · Municipalidad Provincial de Puno

Portal de la Gerencia de Gestión Integral de Residuos Sólidos (GGIRS):

- mapa y horarios de las 29 rutas de recolección, con su estado según la hora de Puno;
- guía de segregación NTP 900.058:2019;
- programa municipal de compostaje;
- campañas Sumaq Ayni;
- noticias;
- reportes vecinales de puntos críticos, con código de seguimiento.

## Puesta en marcha

```bash
npm install
npx playwright install chromium   # sólo para las pruebas E2E
npm run dev                        # http://localhost:3000
```

| Script                        | Qué hace                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| `npm run build` / `npm start` | Build de producción y servidor                                   |
| `npm run lint`                | ESLint (incluye reglas del React Compiler)                       |
| `npm run typecheck`           | Genera los tipos de rutas y corre `tsc`                          |
| `npm run test:e2e`            | Playwright en escritorio y móvil (funcionalidad + accesibilidad) |
| `npm run test:a11y`           | Sólo la auditoría axe WCAG 2.2 AA de todas las páginas           |
| `npm run audit`               | Lint, tipos, build y E2E en cadena                               |
| `npm run format`              | Prettier con orden de clases Tailwind                            |

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
    news/              noticias y lista editorial
    reports/           asistente de reporte, tickets MPP-AAMM-XXXX y seguimiento
    faq/               preguntas frecuentes
    office/            la gerencia: líneas de trabajo, organigrama, cifras e índice de servicios
    home/              carrusel de portada
  shared/
    config/            datos institucionales, navegación y mapa base
    content/           registro de imágenes con créditos y cifras con fuente
    layout/            header, footer, marca
    motion/            primitivas de animación (LineReveal, ImageReveal, Counter…)
    server/            almacén JSON y utilidades de formularios (server-only)
    ui/                botones, secciones, acordeón, campos, íconos
```

Reglas de dependencia:

1. Las páginas importan de `@/modules/<módulo>` (su `index.ts`) y de `@/shared`.
2. Un módulo no importa los internos de otro módulo.
3. Los Client Components importan sólo de `domain/` (código puro). Así los datos completos y Zod no viajan al navegador. El servidor prepara una vista recortada para el planificador de rutas (`plannerView`).
4. Todo lo que toca disco o datos sensibles vive en `server/` e importa `server-only`.

### Persistencia

`createJsonStore` (en `src/shared/server/json-store.ts`) guarda reportes, inscripciones y voluntarios en `.data/`. Si el disco es de sólo lectura, como en una plataforma serverless, trabaja en memoria. Para producción hay que reemplazarlo por un repositorio con base de datos que tenga la misma interfaz (`all`, `get`, `insert`). Ningún otro archivo necesita cambiar.

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
- **Créditos fotográficos:** las fotos CC BY-SA se atribuyen en `/creditos`, enlazada desde el pie de página.
