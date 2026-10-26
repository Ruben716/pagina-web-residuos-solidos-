import { definePage } from "../domain/define";
import { button, heading, hero, line, para, seo } from "./common";

export const CAMPANAS = definePage({
  label: "Campañas Sumaq Ayni",
  path: "/campanas",
  sections: {
    seo: seo(
      "Sumaq Ayni: campañas y voluntariado ambiental",
      "Calendario de reciclatones, limpiezas de la ribera del Titicaca, ecotrueques, talleres de compostaje y campañas de acopio en Puno.",
    ),
    hero: hero({
      eyebrow: "Conciencia ambiental puneña",
      title: "Sumaq Ayni: campañas y eventos ambientales",
      lede: "El ayni andino aplicado al cuidado de nuestra tierra y del lago Titicaca: la ayuda que das hoy vuelve a tu comunidad mañana. Súmate a las jornadas de reciclaje, limpieza y voluntariado.",
    }),
    programa: {
      ...heading("Qué hacemos", {
        eyebrow: "Bonito intercambio",
        title: "Qué hacemos en Sumaq Ayni",
        lede: "Sumaq Ayni es el programa de participación vecinal de la Municipalidad para reducir, reaprovechar y limpiar la ciudad.",
      }),
      list: {
        itemLabel: "Línea",
        items: [
          { title: "Ecotrueques", text: "Canjea botellas PET, papel y cartón limpios por plantones nativos y abono del vivero municipal." },
          { title: "Limpieza del lago", text: "Brigadas vecinales retiran plásticos de la ribera de la bahía interior del Titicaca." },
          { title: "Educación ambiental", text: "Talleres de compostaje y segregación para colegios, juntas vecinales y mercados." },
          { title: "Acopio de peligrosos", text: "Jornadas para entregar pilas, focos y aparatos en desuso con disposición segura." },
        ],
      },
    },
    proximas: heading(
      "Próximas jornadas",
      {
        eyebrow: "Agenda",
        title: "Próximas jornadas",
        lede: "Inscríbete con tu nombre y celular. Te escribimos un día antes con el punto de encuentro.",
      },
      { empty: para("Aviso si no hay jornadas", "Estamos preparando el próximo calendario. Vuelve pronto o síguenos en redes.", 300) },
    ),
    impacto: {
      ...heading(
        "Resultados",
        { eyebrow: "Resultados", title: "Lo que logramos juntos" },
        {
          note: para(
            "Nota bajo las cifras",
            "Cifras reportadas por la gerencia en el sitio anterior; se actualizarán con el informe anual.",
            300,
          ),
        },
      ),
      list: {
        itemLabel: "Cifra",
        titleLabel: "qué mide",
        textLabel: "detalle",
        items: [
          { title: "Toneladas recuperadas", text: "Reciclables retirados en jornadas" },
          { title: "Puntos críticos erradicados", text: "Rehabilitados como áreas limpias" },
          { title: "Voluntarios", text: "Vecinos puneños activos" },
          { title: "Campañas realizadas", text: "Jornadas masivas Sumaq Ayni" },
        ],
      },
    },
    realizadas: heading("Jornadas realizadas", { eyebrow: "Archivo", title: "Jornadas realizadas" }),
  },
});

export const PREGUNTAS = definePage({
  label: "Preguntas frecuentes",
  path: "/preguntas",
  sections: {
    seo: seo(
      "Preguntas frecuentes",
      "Respuestas sobre horarios de recolección, segregación, compostaje y reportes de puntos críticos en Puno.",
    ),
    hero: hero({
      eyebrow: "Orientación vecinal y normativa",
      title: "Preguntas frecuentes sobre la limpieza en Puno",
      lede: "Todo sobre las rutas de recolección, la segregación, el compostaje y los reportes vecinales.",
    }),
    ayuda: { label: "Contacto al final", fields: { title: line("Texto", "¿No encontraste tu respuesta?", 80) } },
  },
});

export const REPORTA = definePage({
  label: "Reporta a tu vecino",
  path: "/reporta",
  sections: {
    seo: seo(
      "Reporta a tu vecino",
      "Denuncia botaderos clandestinos, desmonte o basura fuera de horario en Puno. Recibe un código para seguir la atención.",
    ),
    hero: hero(
      {
        eyebrow: "Fiscalización ciudadana",
        title: "Reporta a tu vecino y los puntos críticos",
        lede: "Canal directo para denunciar botaderos clandestinos, desmonte o basura fuera del horario de recojo. Tu reporte llega a fiscalización ambiental.",
      },
      { button: button("¿Ya tienes un código? Consulta tu reporte", "Botón") },
    ),
    pasos: {
      label: "Tres pasos",
      fields: {},
      list: {
        itemLabel: "Paso",
        items: [
          { title: "Evidencia fotográfica", text: "Adjunta una foto del botadero o del punto crítico para sustentar la intervención." },
          {
            title: "Ubicación exacta",
            text: "Usa el GPS de tu celular o mueve el pin en el mapa para un despacho rápido de las cuadrillas.",
          },
          { title: "Seguimiento con código", text: "Recibes un código único para ver en qué etapa está la atención de tu reporte." },
        ],
      },
    },
    formulario: heading("Formulario", {
      eyebrow: "Asistente de reporte municipal",
      title: "Envía tu reporte en tres pasos",
      lede: "Toma menos de dos minutos. Puedes reportar de forma anónima.",
    }),
    norma: {
      label: "Lo que dice la norma",
      fields: {
        title: line("Rótulo", "Lo que dice la norma", 60),
        text: para(
          "Texto",
          "Arrojar residuos sólidos o desmonte en la vía pública, áreas verdes o la ribera del lago es una infracción sancionable con multa.",
          400,
        ),
        note: para(
          "Nota",
          "Ley de Gestión Integral de Residuos Sólidos (D. Leg. N.° 1278) y ordenanzas de la Municipalidad Provincial de Puno. El monto de la multa depende de la ordenanza vigente y de la gravedad de la infracción.",
          500,
        ),
      },
    },
  },
});

export const SEGUIMIENTO = definePage({
  label: "Seguimiento de reportes",
  path: "/reporta/seguimiento",
  sections: {
    seo: seo("Seguimiento de reportes", "Consulta con tu código en qué etapa está la atención de tu reporte de punto crítico."),
    hero: hero({
      eyebrow: "Reporta a tu vecino",
      title: "Sigue tu reporte",
      lede: "Escribe el código que recibiste al enviar tu reporte para ver en qué etapa está la atención.",
    }),
    vacio: {
      label: "Antes de consultar",
      fields: { text: para("Texto", "Cuando consultes un código, aquí verás las etapas de atención de tu reporte.", 300) },
    },
  },
});
