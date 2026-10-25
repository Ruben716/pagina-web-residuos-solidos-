/**
 * Cifras públicas con su fuente. Si una cifra se actualiza, se cambia aquí y se refleja en todo el sitio.
 */
export const SOURCES = {
  ecrs2015: {
    label: "Estudio de Caracterización de Residuos Sólidos del Distrito de Puno 2015, Municipalidad Provincial de Puno",
    url: "https://sinia.minam.gob.pe/metadatos/298908",
  },
  cancharani: {
    label: "Andina, 27 de mayo de 2024",
    url: "https://andina.pe/agencia/noticia-puno-recuperacion-terreno-afectada-residuos-ayudara-a-mejorar-cuidado-del-ambiente-987090.aspx",
  },
  itapalluni: {
    label: "Andina, 30 de octubre de 2019",
    url: "https://andina.pe/agencia/noticia-puno-ya-cuenta-un-nuevo-relleno-sanitario-y-planta-valorizacion-771399.aspx",
  },
  ntp: {
    label: "NTP 900.058:2019, R.D. N.° 003-2019-INACAL/DN",
    url: "https://andina.pe/ingles/noticia-inacal-promueve-uso-codigo-colores-para-segregacion-responsable-residuos-solidos-840364.aspx",
  },
} as const;

export const WASTE_FACTS = {
  tonsPerDay: 106.09,
  householdTonsPerDay: 78.68,
  kgPerPersonPerDay: 0.55,
  organicShare: 0.6732,
  recyclableShare: 0.1716,
  residualShare: 0.1552,
  recoverableShare: 0.8448,
  willingToSeparate: 0.64,
} as const;
