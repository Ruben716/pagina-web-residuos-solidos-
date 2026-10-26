import type { MediaRef } from "@/modules/media";
import type { Slide } from "./hero-carousel";

/** Diapositiva con la clave de su imagen; la página la cambia por la imagen vigente del panel. */
export type SlideData = Omit<Slide, "image"> & { image: MediaRef };

// Portada institucional: qué es la gerencia y qué cuida. Los servicios tienen su propia sección.
export const SLIDES: readonly SlideData[] = [
  {
    id: "gerencia",
    badge: "Gerencia de Gestión Integral de Residuos Sólidos",
    title: "Cuidamos Puno y el lago Titicaca desde cada calle",
    text: "Somos la gerencia municipal que limpia la ciudad, recoge sus residuos, valoriza lo que se puede aprovechar y da disposición final segura a lo demás.",
    image: "titicacaBosque",
    focus: "50% 60%",
    stats: [
      { value: "2 subgerencias", label: "Limpieza y valorización" },
      { value: "29 rutas", label: "De recolección" },
      { value: "Todos los días", label: "Del año" },
    ],
    cta: { href: "#gerencia", label: "Conoce la gerencia" },
    secondary: { href: "/rutas", label: "Rutas y horarios" },
  },
  {
    id: "limpieza",
    badge: "Limpieza pública",
    title: "Una ciudad limpia es trabajo de todos los días",
    text: "Cuadrillas de barrido y camiones compactadores recorren el centro y los barrios. En el centro histórico se hacen tres jornadas de limpieza al día.",
    image: "cuadrillaLimpieza",
    focus: "50% 45%",
    stats: [
      { value: "3 jornadas", label: "Al día en el centro" },
      { value: "4 sectores", label: "De la ciudad" },
      { value: "3 turnos", label: "De recolección" },
    ],
    cta: { href: "#que-hacemos", label: "Qué hacemos" },
    secondary: { href: "/reporta", label: "Reportar un punto crítico" },
  },
  {
    id: "valorizacion",
    badge: "Economía circular",
    title: "Lo orgánico vuelve a la tierra",
    text: "Los restos de mercados y colegios se convierten en compost en la planta municipal de valorización, y lo reciclable vuelve a la cadena con recicladores formalizados.",
    image: "compostajeMunicipal",
    focus: "65% 50%",
    stats: [
      { value: "+2 t", label: "Orgánicos de mercados al día" },
      { value: "60 %", label: "De la basura es aprovechable" },
      { value: "Gratis", label: "Compost para vecinos" },
    ],
    cta: { href: "/compostaje", label: "Programa de compostaje" },
    secondary: { href: "/segregacion", label: "Cómo segregar" },
  },
  {
    id: "lago",
    badge: "Sumaq Ayni",
    title: "Un lago vivo empieza en casa",
    text: "Lo que tiramos en la calle termina en los canales y en la bahía. Súmate a las campañas de limpieza, ecotrueques y educación ambiental.",
    image: "punoCiudadLago",
    focus: "50% 55%",
    stats: [
      { value: "3 812 m", label: "Altitud del lago" },
      { value: "Mensuales", label: "Jornadas de limpieza" },
      { value: "Abiertas", label: "A todos los vecinos" },
    ],
    cta: { href: "/campanas", label: "Ver campañas" },
    secondary: { href: "/actualidad", label: "Actualidad" },
  },
];
