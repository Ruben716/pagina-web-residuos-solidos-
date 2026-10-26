import { definePage } from "../domain/define";
import { button, heading, line, para } from "./common";

export const INICIO = definePage({
  label: "Portada",
  path: "/",
  sections: {
    gerencia: heading(
      "Quiénes somos",
      { eyebrow: "Quiénes somos", title: "La gerencia que mantiene limpia la ciudad de Puno" },
      {
        p1: {
          ...para(
            "Primer párrafo",
            "La **{gerencia}** es el órgano de la {municipalidad} que se encarga de que los residuos de la ciudad se recojan, se aprovechen y terminen en un lugar seguro.",
          ),
          rich: true,
        },
        p2: {
          ...para(
            "Segundo párrafo",
            "Trabaja con dos subgerencias: **Limpieza Pública y Recolección**, en la calle, y **Valorización y Disposición Final**, en la planta de compostaje y el relleno sanitario de Itapalluni. Su meta: que cada vez menos residuos lleguen al relleno y al lago Titicaca.",
          ),
          rich: true,
        },
        badge: line("Sello sobre la foto (1.ª línea)", "De la calle", 40),
        badgeSub: line("Sello sobre la foto (2.ª línea)", "al relleno sanitario", 40),
      },
    ),
    pilares: {
      label: "Quiénes somos: tres pilares",
      fields: {},
      list: {
        itemLabel: "Pilar",
        items: [
          { title: "Ciudad limpia", text: "Barrido y recolección en los cuatro sectores, todos los días." },
          { title: "Residuos que vuelven a servir", text: "Compost con lo orgánico y reciclaje con recicladores formalizados." },
          { title: "Vecinos que participan", text: "Segregación en casa, campañas Sumaq Ayni y reportes ciudadanos." },
        ],
      },
    },
    queHacemos: heading("Qué hacemos", {
      eyebrow: "Qué hacemos",
      title: "Cada residuo tiene un camino, de tu puerta al relleno sanitario",
      lede: "Cinco líneas de trabajo a cargo de las dos subgerencias. Pasa el cursor o elige una para conocerla.",
    }),
    servicios: heading("Servicios", {
      eyebrow: "Servicios para el vecino",
      title: "¿Qué necesitas hoy?",
      lede: "Cada servicio tiene su propia sección en este portal.",
    }),
    cifras: heading("Puno en cifras", { eyebrow: "Puno en cifras", title: "Lo que genera la ciudad y lo que podemos recuperar" }),
    organizacion: heading("Organización", {
      eyebrow: "Organización",
      title: "Quiénes están a cargo",
      lede: "La gerencia y sus dos subgerencias. Escríbeles directamente o acércate al Palacio Municipal.",
    }),
    noticias: heading("Notas de prensa", { eyebrow: "Sala de prensa", title: "Notas de prensa" }, { button: button("Todas las notas") }),
    reporta: heading(
      "Llamado a reportar",
      { eyebrow: "Fiscalización ciudadana", title: "¿Una esquina se volvió basural? Repórtala" },
      {
        text: para(
          "Texto",
          "Envía una foto y la ubicación. El reporte llega a fiscalización y recibes un código para seguir cada etapa, también si lo envías de forma anónima.",
          300,
        ),
        button: button("Reportar ahora", "Botón principal"),
        secondary: button("Seguir mi reporte", "Botón secundario"),
      },
    ),
  },
});
