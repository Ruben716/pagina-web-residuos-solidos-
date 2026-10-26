-- Notas iniciales de la sala de prensa (src/modules/news/seed.ts). Se copian una sola vez:
-- desde aquí se editan, publican o eliminan en el panel.
INSERT INTO "news_articles" ("slug", "title", "excerpt", "body", "category", "image", "date", "source_label", "source_url", "status", "updated_by") VALUES
('laykakota-punto-critico-erradicado', 'Laykakota recupera ocho puntos críticos de basura', 'Cuadrillas de limpieza y fiscalizadores intervinieron esquinas donde la basura se acumulaba fuera de horario.', 'La Gerencia de Gestión Integral de Residuos Sólidos intervino ocho puntos críticos del barrio Laykakota, donde vecinos y comerciantes dejaban bolsas fuera del horario de la ruta 02.

Tras el retiro de los residuos, los espacios se limpiaron y se señalizaron con el horario de recojo. Los fiscalizadores visitarán la zona durante las próximas semanas.

Si ves que un punto vuelve a llenarse, repórtalo desde esta web: cada reporte queda registrado con un código que puedes seguir.', 'Intervención', 'puntoCritico', '2026-03-15', NULL, NULL, 'published', 'Sistema'),
('recoleccion-selectiva-bolsa-verde', 'Así funciona la recolección selectiva con bolsa verde', 'Promotores ambientales visitan las viviendas, entregan la bolsa verde y fijan el día de recojo de los reciclables.', 'El Programa de Segregación en la Fuente y Recolección Selectiva empieza con la visita de un promotor ambiental a tu vivienda.

Si tu hogar se suma, recibes una bolsa verde para los residuos aprovechables: papel, cartón, botellas, latas y vidrio, limpios y secos. El promotor te indica el día y la hora en que pasa el vehículo de recolección selectiva.

Lo que se recupera llega a recicladores formalizados, que lo clasifican y lo devuelven a la cadena productiva.', 'Orientación', 'recoleccionSelectiva', '2026-03-10', 'SINIA, MINAM', 'https://sinia.minam.gob.pe/novedades/programa-segregacion-fuente-recoleccion-selectiva-residuos-solidos-0', 'published', 'Sistema'),
('reciclaton-15-toneladas', 'El Reciclatón de verano recuperó 15 toneladas', 'Más de 1 200 vecinos llevaron plásticos, cartón y metales al Parque Pino en la jornada Sumaq Ayni.', 'La jornada Sumaq Ayni de marzo reunió a más de 1 200 vecinos de los cuatro sectores de la ciudad.

Se recuperaron 15 toneladas de material reciclable que se entregaron a asociaciones de recicladores formalizados de Puno.

La próxima jornada de canje está en el calendario de campañas.', 'Campaña', 'recicladores', '2026-03-05', NULL, NULL, 'published', 'Sistema'),
('compost-mercado-union-y-dignidad', 'Promotores ambientales entregan compost a comerciantes del mercado Unión y Dignidad', 'El abono se produjo en la planta municipal con los residuos orgánicos que los mismos mercados separan cada día.', 'Con el objetivo de promover una adecuada segregación de residuos sólidos, la Municipalidad Provincial de Puno, a través de la Gerencia de Gestión Integral de Residuos Sólidos, visitó a los comerciantes del centro de abastos Unión y Dignidad y les entregó compost orgánico como resultado de su participación en las rutas de recolección de residuos orgánicos que gestiona la Sub Gerencia de Valorización y Disposición Final.

En la actividad también participaron los establecimientos de comida de los alrededores del mercado, para seguir impulsando la campaña de segregación.

A diario se recolecta más de una tonelada de residuos orgánicos de estos mercados. Se trasladan a la planta de compostaje de la Municipalidad, donde se valorizan con el método Takakura hasta obtener abono orgánico para fertilizar la tierra.

Con estas acciones la Municipalidad busca reducir la disposición final de residuos en el relleno sanitario y avanzar hacia una ciudad responsable y sostenible.', 'Campaña', 'compostMercado', '2025-03-14', 'Municipalidad Provincial de Puno', 'https://portal.munipuno.gob.pe/es/promotores-ambientales-realizan-entrega-de-compost-organico-comerciantes-del-mercado-union-y', 'published', 'Sistema'),
('cancharani-area-recuperada', 'Cancharani: 4.8 hectáreas recuperadas del antiguo botadero', 'El MINAM entregó la recuperación del área degradada donde Puno arrojó su basura durante décadas.', 'El botadero de Cancharani, en la periferia de la ciudad, recibió por años más de 100 toneladas de residuos al día hasta llegar al final de su vida útil en 2018.

Entre julio y diciembre de 2023 se ejecutó el proyecto de recuperación del área degradada, con una inversión de más de 4 millones de soles del Ministerio del Ambiente. Se recuperaron 4.8 hectáreas.

Los residuos que quedaron en el lugar deben estabilizarse durante al menos cuatro años antes de que el terreno pueda tener un uso recreativo.', 'Infraestructura', 'panorama', '2024-05-27', 'Andina', 'https://andina.pe/agencia/noticia-puno-recuperacion-terreno-afectada-residuos-ayudara-a-mejorar-cuidado-del-ambiente-987090.aspx', 'published', 'Sistema'),
('relleno-sanitario-itapalluni', 'Puno cuenta con el relleno sanitario de Itapalluni', 'La infraestructura, a 12 km de la ciudad, incluye una planta de valorización de residuos orgánicos e inorgánicos.', 'El relleno sanitario y planta de valorización de Itapalluni se ubica en la comunidad campesina del mismo nombre, a unos 12 kilómetros de la ciudad y a 4 200 metros de altitud.

Fue financiado con el Ministerio del Ambiente y la cooperación japonesa (JICA), con una capacidad de 147 toneladas diarias.

Cuenta con celdas de disposición, chimeneas para gases, sistema de manejo de lixiviados y una planta para valorizar residuos orgánicos e inorgánicos.', 'Infraestructura', 'compactador', '2019-10-30', 'Andina', 'https://andina.pe/agencia/noticia-puno-ya-cuenta-un-nuevo-relleno-sanitario-y-planta-valorizacion-771399.aspx', 'published', 'Sistema'),
('codigo-de-colores-ntp', 'Cuatro colores para los residuos de tu casa', 'La NTP 900.058:2019 fijó el código de colores que usan las municipalidades del Perú.', 'La Norma Técnica Peruana 900.058:2019, aprobada por INACAL, establece los colores de los recipientes para almacenar residuos sólidos.

En el ámbito municipal, es decir en casas y espacios públicos, son cuatro: verde para aprovechables, marrón para orgánicos, negro para no aprovechables y rojo para peligrosos.

En empresas e instituciones se usa una versión ampliada de siete colores que separa papel, plástico, metales y vidrio.', 'Orientación', 'contenedoresParque', '2019-03-28', 'Andina', 'https://andina.pe/ingles/noticia-inacal-promueve-uso-codigo-colores-para-segregacion-responsable-residuos-solidos-840364.aspx', 'published', 'Sistema')
ON CONFLICT ("slug") DO NOTHING;
