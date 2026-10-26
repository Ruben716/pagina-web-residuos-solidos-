import { definePage } from "../domain/define";
import { heading, hero, seo } from "./common";

export const RUTAS = definePage({
  label: "Rutas y horarios",
  path: "/rutas",
  sections: {
    seo: seo(
      "Rutas y horarios de recolección",
      "Mapa de las 29 rutas de recolección de residuos de Puno: por dónde pasa el camión, qué días y a qué hora.",
    ),
    hero: hero({
      eyebrow: "Sistema integral de limpieza pública",
      title: "Rutas y horarios de recolección",
      lede: "Las 29 rutas de recolección cubren los cuatro sectores de la ciudad en tres turnos. Busca tu calle o elige tu ruta para ver su recorrido en el mapa.",
    }),
    horarios: heading("Cuadro de horarios", {
      eyebrow: "Cuadro de horarios",
      title: "Horarios por sector",
      lede: "Horario programado de cada ruta. El estado “ahora” se calcula con la hora de Puno y puede variar por tráfico, clima o mantenimiento de la unidad.",
    }),
    consejos: {
      ...heading("Recomendaciones", { eyebrow: "Recomendaciones", title: "Antes de sacar tu basura" }),
      list: {
        itemLabel: "Consejo",
        items: [
          {
            title: "Saca la bolsa a tiempo",
            text: "Hazlo poco antes de que pase el camión. Una bolsa en la esquina antes de hora se rompe y se esparce.",
          },
          {
            title: "Bolsas cerradas y separadas",
            text: "Entrega tus residuos separados por color y en bolsas bien amarradas, sin líquidos.",
          },
          {
            title: "¿No pasó el camión?",
            text: "Revisa que hoy sea día de servicio de tu ruta. Si lo era, repórtalo y guarda tu basura dentro de casa.",
          },
        ],
      },
    },
  },
});
