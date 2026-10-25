import { MEDIA } from "@/shared/content/media";
import type { Slide } from "./hero-carousel";

// Recrea las cinco portadas del sitio de referencia con textos verificables.
export const SLIDES: readonly Slide[] = [
  {
    id: "rutas",
    badge: "Rutas de recolección",
    title: "Por dónde y cuándo pasa el camión por tu calle",
    text: "Busca tu calle y mira en el mapa el recorrido, los días y el horario de las 29 rutas de recolección de la ciudad de Puno.",
    image: MEDIA.recoleccionSelectiva,
    focus: "60% 40%",
    stats: [
      { value: "29", label: "Rutas activas" },
      { value: "4", label: "Sectores de la ciudad" },
      { value: "3", label: "Turnos al día" },
    ],
    cta: { href: "#rutas", label: "Ver el mapa de rutas" },
    secondary: { href: "/rutas#horarios", label: "Horarios por sector" },
  },
  {
    id: "segregacion",
    badge: "Segregación en la fuente",
    title: "Separa tus residuos en cuatro colores",
    text: "Orgánicos, aprovechables, no aprovechables y peligrosos. Una buena segregación en casa hace posible el reciclaje y el compostaje en Puno.",
    image: MEDIA.contenedoresPlaza,
    focus: "50% 60%",
    stats: [
      { value: "4 colores", label: "NTP 900.058:2019" },
      { value: "84 %", label: "De la basura es aprovechable" },
      { value: "44", label: "Objetos en el buscador" },
    ],
    cta: { href: "/segregacion", label: "Aprender a segregar" },
    secondary: { href: "/segregacion#buscador", label: "¿Dónde va esto?" },
  },
  {
    id: "compostaje",
    badge: "Economía circular",
    title: "Programa Municipal de Compostaje",
    text: "Inscríbete gratis, recibe tu compostera y capacitación, y convierte los restos de tu cocina en abono para tu huerto y los parques de la ciudad.",
    image: MEDIA.compostajeMunicipal,
    focus: "65% 50%",
    stats: [
      { value: "Gratis", label: "Inscripción y kit" },
      { value: "67 %", label: "De la basura es orgánica" },
      { value: "+1 t diaria", label: "De orgánicos de mercados" },
    ],
    cta: { href: "/compostaje#inscripcion", label: "Inscribirme al programa" },
    secondary: { href: "/compostaje#calculadora", label: "Calcular mi impacto" },
  },
  {
    id: "sumaq-ayni",
    badge: "Cuidado del lago Titicaca",
    title: "Sumaq Ayni: campañas y voluntariado",
    text: "Súmate a las jornadas de limpieza de la bahía interior del Titicaca, a los ecotrueques barriales y a las campañas de educación ambiental.",
    image: MEDIA.recicladores,
    focus: "50% 35%",
    stats: [
      { value: "Mensuales", label: "Jornadas 2026" },
      { value: "Plantas x botellas", label: "Ecotrueques" },
      { value: "+1 200", label: "Vecinos voluntarios" },
    ],
    cta: { href: "/campanas", label: "Ver campañas activas" },
    secondary: { href: "/segregacion", label: "Segregación en la fuente" },
  },
  {
    id: "reporta",
    badge: "Fiscalización ciudadana",
    title: "Reporta a tu vecino",
    text: "Denuncia botaderos clandestinos y basura fuera de horario con una foto y la ubicación. Recibe un código para seguir la atención de tu reporte.",
    image: MEDIA.puntoCritico,
    focus: "50% 70%",
    stats: [
      { value: "3 pasos", label: "Foto, lugar y envío" },
      { value: "GPS", label: "Ubicación exacta" },
      { value: "Código", label: "Seguimiento del caso" },
    ],
    cta: { href: "/reporta", label: "Reportar ahora" },
    secondary: { href: "/reporta/seguimiento", label: "Seguir mi reporte" },
  },
];
