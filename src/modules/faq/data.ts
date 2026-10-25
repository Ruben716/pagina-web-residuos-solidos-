export interface Faq {
  id: string;
  question: string;
  answer: string;
  topic: "Recolección" | "Segregación" | "Compostaje" | "Reportes";
}

export const FAQS: readonly Faq[] = [
  {
    id: "horario",
    topic: "Recolección",
    question: "¿Cómo sé a qué hora pasa el camión por mi calle?",
    answer:
      "Escribe el nombre de tu calle en el buscador de la página de rutas. Verás la ruta que te corresponde, los días de servicio, el horario y si el camión está en recorrido en este momento.",
  },
  {
    id: "no-paso",
    topic: "Recolección",
    question: "El camión no pasó hoy. ¿Qué hago?",
    answer:
      "Primero revisa que hoy sea un día de servicio de tu ruta. Si lo era, repórtalo como “El camión no pasó por mi calle”: el reporte llega a la central y recibirás un código para seguirlo. Mientras tanto, guarda tu basura dentro de casa; no la dejes en la esquina.",
  },
  {
    id: "monitoreo",
    topic: "Recolección",
    question: "¿Las 29 rutas tienen seguimiento en vivo?",
    answer:
      "El estado que ves en la web se calcula con el horario programado de cada ruta y la hora de Puno. El seguimiento GPS de los camiones se irá incorporando por etapas, empezando por las rutas piloto.",
  },
  {
    id: "colores",
    topic: "Segregación",
    question: "¿Qué colores debo usar para separar mis residuos?",
    answer:
      "En casa se usan cuatro, según la NTP 900.058:2019: verde para aprovechables, marrón para orgánicos, negro para no aprovechables y rojo para peligrosos. No necesitas comprar tachos de colores: basta con bolsas o cajas marcadas.",
  },
  {
    id: "pilas",
    topic: "Segregación",
    question: "¿Dónde dejo las pilas, focos y medicamentos vencidos?",
    answer:
      "Nunca en la basura común. Guárdalos en un frasco o caja cerrada y llévalos a una campaña de acopio Sumaq Ayni o a un punto de acopio municipal.",
  },
  {
    id: "compost-costo",
    topic: "Compostaje",
    question: "¿La inscripción al programa de compostaje tiene costo?",
    answer:
      "No. La inscripción, la capacitación y el acompañamiento técnico son gratuitos. Sólo pedimos el compromiso de separar los orgánicos de tu casa y asistir a la charla de inicio.",
  },
  {
    id: "compost-espacio",
    topic: "Compostaje",
    question: "Vivo en un departamento sin patio. ¿Puedo compostar?",
    answer:
      "Sí. Una compostera pequeña cabe en una azotea o balcón. Si no tienes ningún espacio, puedes sumarte al huerto comunal de tu junta vecinal o entregar tus orgánicos separados en los días de recojo marrón.",
  },
  {
    id: "reporte-anonimo",
    topic: "Reportes",
    question: "¿Puedo reportar sin dar mi nombre?",
    answer:
      "Sí. Marca la opción de reporte anónimo. No guardamos tu nombre ni tu teléfono, y de todas formas recibes un código para seguir la atención.",
  },
  {
    id: "multas",
    topic: "Reportes",
    question: "¿Qué pasa con quien arroja basura en la calle?",
    answer:
      "Arrojar residuos o desmonte en la vía pública, áreas verdes o la ribera del lago es una infracción. Los fiscalizadores verifican el reporte en campo y, si identifican al infractor, aplican la multa que fija la ordenanza vigente.",
  },
];
