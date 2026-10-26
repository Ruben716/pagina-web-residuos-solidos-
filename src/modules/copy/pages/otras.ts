import { definePage } from "../domain/define";
import { button, heading, hero, line, para, seo } from "./common";

export const COMPOSTAJE = definePage({
  label: "Compostaje",
  path: "/compostaje",
  sections: {
    seo: seo(
      "Programa Municipal de Compostaje",
      "Convierte los residuos orgánicos de tu casa en abono. Inscripción gratuita, compostera, capacitación y acompañamiento técnico de la Municipalidad Provincial de Puno.",
    ),
    hero: hero(
      {
        eyebrow: "Economía circular",
        title: "Programa Municipal de Compostaje",
        lede: "Dos de cada tres kilos de basura de un hogar puneño son restos orgánicos. En una compostera dejan de ser basura y vuelven a la tierra como abono.",
      },
      { button: button("Inscribirme gratis", "Botón principal"), secondary: button("Calcular mi impacto", "Botón secundario") },
    ),
    planta: {
      ...heading(
        "Planta municipal",
        { eyebrow: "Planta municipal de compostaje", title: "Lo orgánico de los mercados vuelve como abono" },
        {
          p1: para(
            "Primer párrafo",
            "Cada día se recoge más de una tonelada de residuos orgánicos de los mercados de la ciudad. La Sub Gerencia de Valorización y Disposición Final los lleva a la planta de compostaje de la Municipalidad, donde se transforman en abono con el método Takakura.",
          ),
          p2: para(
            "Segundo párrafo",
            "Ese compost vuelve a los comerciantes que separan sus residuos, como los del centro de abastos Unión y Dignidad, y a las áreas verdes de Puno. Menos residuos llegan al relleno sanitario.",
          ),
        },
      ),
      list: {
        itemLabel: "Cifra",
        titleLabel: "cifra",
        textLabel: "qué indica",
        items: [
          { title: "+1 t", text: "de orgánicos al día desde los mercados" },
          { title: "67 %", text: "de la basura domiciliaria es orgánica" },
        ],
      },
    },
    calculadora: heading("Calculadora", {
      eyebrow: "Calculadora de impacto",
      title: "¿Cuánto abono puede producir tu familia?",
      lede: "Mueve el control según cuántas personas viven en tu casa.",
    }),
    pasos: {
      ...heading("Paso a paso", { eyebrow: "Paso a paso", title: "Cómo funciona el programa" }),
      list: {
        itemLabel: "Paso",
        items: [
          { title: "Te inscribes", text: "Llenas el formulario de esta página. Un promotor ambiental te llama en los días siguientes." },
          { title: "Recibes el kit", text: "Compostera doméstica o tacho aireado, manual digital y una charla de inicio para tu familia." },
          {
            title: "Alimentas la compostera",
            text: "Capas de restos de cocina y material seco, como hojas o aserrín. Remueves una vez por semana.",
          },
          {
            title: "Cosechas abono",
            text: "En tres o cuatro meses tienes compost maduro para tus macetas, tu huerto o los parques del barrio.",
          },
        ],
      },
    },
    inscripcion: heading(
      "Inscripción",
      { eyebrow: "Formulario de inscripción", title: "Inscríbete gratis" },
      {
        includedTitle: line("Antes de la lista", "Qué incluye:", 60),
        included: {
          label: "Qué incluye",
          lines: true,
          hint: "Un elemento por línea.",
          value: [
            "Compostera doméstica municipal o tacho aireado",
            "Manual digital y talleres de capacitación",
            "Asesoría técnica para huertos urbanos",
            "Registro en la red de hogares sostenibles de Puno",
            "Seguimiento técnico hasta la primera cosecha",
          ].join("\n"),
        },
        requirement: para(
          "Requisito",
          "Único requisito: el compromiso de separar los orgánicos de tu casa y asistir a la charla municipal.",
          300,
        ),
      },
    ),
  },
});

export const NOTICIAS = definePage({
  label: "Notas de prensa",
  path: "/noticias",
  sections: {
    seo: seo("Notas de prensa", "Intervenciones, campañas, infraestructura y orientación sobre la gestión de residuos sólidos en Puno."),
    hero: hero({
      eyebrow: "Sala de prensa",
      title: "Notas de prensa",
      lede: "Lo que hace la Municipalidad con la basura de la ciudad: intervenciones, campañas, obras y resultados de la gestión.",
    }),
    notas: heading(
      "Lista de notas",
      { eyebrow: "Artículos recientes", title: "Intervenciones, obras y orientación" },
      { empty: para("Aviso si no hay notas", "Pronto publicaremos las primeras notas.", 200) },
    ),
    relacionadas: heading("Al final de cada nota", { eyebrow: "Seguir leyendo", title: "Más notas de prensa" }),
    galeria: heading(
      "Galería",
      {
        eyebrow: "Impacto real",
        title: "La gestión en imágenes",
        lede: "Fotografías de las actividades de la Gerencia de Gestión Integral de Residuos Sólidos.",
      },
      {
        captions: {
          label: "Pies de foto",
          lines: true,
          hint: "Uno por línea, en el orden de las fotos (cuatro). Las fotos se cambian en Imágenes.",
          value: [
            "Palacio Municipal, sede de la atención al vecino",
            "Entrega de compost en el mercado Unión y Dignidad",
            "Recolección selectiva de aprovechables",
            "Intervención en La Rinconada Salcedo",
          ].join("\n"),
        },
      },
    ),
  },
});

export const ACTUALIDAD = definePage({
  label: "Actualidad",
  path: "/actualidad",
  sections: {
    seo: seo(
      "Actualidad",
      "Noticias y comunicados de la Gerencia de Gestión Integral de Residuos Sólidos: operativos, campañas, avisos y resultados, al día con Facebook.",
    ),
    hero: hero(
      {
        eyebrow: "Noticias y comunicados",
        title: "Actualidad",
        lede: "Operativos de limpieza, campañas, avisos de horario y resultados de la gestión, al día con nuestra página de Facebook.",
      },
      { button: button("Seguir en Facebook") },
    ),
  },
});

export const CREDITOS = definePage({
  label: "Créditos fotográficos",
  path: "/creditos",
  sections: {
    hero: {
      label: "Cabecera",
      fields: {
        title: line("Titular", "Créditos fotográficos", 120),
        lede: para(
          "Entradilla",
          "Fotografías de terceros usadas en este sitio, con su autor y licencia. Las demás fotografías son de la Municipalidad Provincial de Puno.",
          400,
        ),
      },
    },
  },
});
