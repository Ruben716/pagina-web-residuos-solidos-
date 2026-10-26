import type { MediaKey } from "@/shared/content/media";

export type BinId = "aprovechable" | "organico" | "no-aprovechable" | "peligroso";

export interface Bin {
  id: BinId;
  color: string;
  colorName: string;
  name: string;
  /** cuándo se entrega */
  schedule: string;
  /** rótulo corto de días de recojo (sitio de referencia) */
  days: string;
  /** recipiente */
  container: string;
  /** días de recojo (ISO: 1 = lunes … 7 = domingo); vacío si se entrega en puntos de acopio */
  weekdays: readonly number[];
  /** íconos de ejemplo para la animación del tacho (decorativos) */
  emoji: readonly string[];
  summary: string;
  examples: readonly string[];
  tip: string;
  /** valor CSS del color de la categoría */
  swatch: string;
  /** texto legible sobre el swatch */
  ink: string;
  /** foto real de ejemplo */
  image: MediaKey;
}

// NTP 900.058:2019 (R.D. N.° 003-2019-INACAL/DN), ámbito municipal: cuatro colores.
export const BINS: readonly Bin[] = [
  {
    id: "aprovechable",
    weekdays: [2, 4, 6],
    emoji: ["🧴", "📦", "🥫", "🍾", "📰"],
    days: "MAR · JUE · SÁB",
    container: "Tacho o bolsa verde",
    color: "Verde",
    colorName: "verde",
    name: "Aprovechables",
    schedule: "Martes, jueves y sábado, en el camión de recolección selectiva",
    summary: "Todo lo que puede volver a ser materia prima. Limpio, seco y aplastado ocupa la mitad y vale el doble para los recicladores.",
    examples: [
      "Botellas PET aplastadas",
      "Papel y cartón secos",
      "Latas y metales",
      "Envases de vidrio",
      "Tetrapak enjuagado",
      "Plásticos rígidos",
    ],
    tip: "Enjuaga los envases y aplástalos. Un envase con restos de comida contamina toda la bolsa.",
    swatch: "var(--color-aprovechable)",
    ink: "#ffffff",
    image: "binAprovechables",
  },
  {
    id: "organico",
    weekdays: [1, 3, 5],
    emoji: ["🍌", "🥚", "🍂", "🥕", "☕"],
    days: "LUN · MIÉ · VIE",
    container: "Tacho o bolsa marrón",
    color: "Marrón",
    colorName: "marrón",
    name: "Orgánicos",
    schedule: "Lunes, miércoles y viernes; o en tu compostera",
    summary:
      "Dos de cada tres kilos de basura de un hogar puneño son restos orgánicos. Bien separados se convierten en abono para los parques de la ciudad.",
    examples: [
      "Cáscaras de frutas y verduras",
      "Restos de comida",
      "Borra de café e infusiones",
      "Cáscaras de huevo",
      "Hojas secas y poda",
      "Aserrín sin tratar",
    ],
    tip: "Escurre los restos antes de embolsarlos: menos líquido, menos olor y un compost de mejor calidad.",
    swatch: "var(--color-organico)",
    ink: "#ffffff",
    image: "binOrganicos",
  },
  {
    id: "no-aprovechable",
    weekdays: [1, 2, 3, 4, 5, 6, 7],
    emoji: ["🧻", "😷", "🍬", "🪥"],
    days: "Diario · turno noche",
    container: "Tacho o bolsa negra",
    color: "Negro",
    colorName: "negro",
    name: "No aprovechables",
    schedule: "Todos los días, en el turno de tu ruta",
    summary:
      "Lo que no se puede recuperar y va al relleno sanitario de Itapalluni. Mientras menos llenes esta bolsa, mejor va la segregación de tu casa.",
    examples: [
      "Papel higiénico y pañales",
      "Colillas de cigarro",
      "Tecnopor sucio",
      "Envolturas metalizadas",
      "Mascarillas y guantes",
      "Cerámica rota (envuelta)",
    ],
    tip: "Envuelve vidrios o cerámicas rotas en papel periódico y márcalas: protegen a quien recoge tu bolsa.",
    swatch: "var(--color-no-aprovechable)",
    ink: "#ffffff",
    image: "binNoAprovechables",
  },
  {
    id: "peligroso",
    weekdays: [],
    emoji: ["🔋", "💡", "💊", "📱"],
    days: "Puntos de acopio",
    container: "Tacho o bolsa roja",
    color: "Rojo",
    colorName: "rojo",
    name: "Peligrosos",
    schedule: "Puntos de acopio municipales y campañas Sumaq Ayni",
    summary:
      "Pequeños pero tóxicos: una sola pila puede contaminar miles de litros de agua que terminan en la bahía interior del Titicaca.",
    examples: [
      "Pilas y baterías",
      "Focos ahorradores y fluorescentes",
      "Medicamentos vencidos",
      "Envases de aerosoles",
      "Envases de plaguicidas",
      "Aparatos eléctricos en desuso",
    ],
    tip: "Nunca los mezcles con la basura común. Guárdalos en un frasco cerrado hasta la próxima campaña de acopio.",
    swatch: "var(--color-peligroso)",
    ink: "#ffffff",
    image: "binPeligrosos",
  },
];

export interface WasteItem {
  name: string;
  bin: BinId;
  note?: string;
  /** otros nombres con que la gente lo busca */
  aliases?: readonly string[];
}

/** Ícono de cada objeto para el juego "¿En qué bolsa va?" (decorativo; el nombre siempre va escrito). */
export const ITEM_EMOJI: Readonly<Record<string, string>> = {
  "Aceite de cocina usado": "🫗",
  Aerosoles: "🧯",
  "Aserrín sin tratar": "🪵",
  "Bolsas plásticas limpias": "🛍️",
  "Borra de café": "☕",
  "Botellas de plástico PET": "🧴",
  "Botellas de vidrio": "🍾",
  "Cajas de cartón": "📦",
  "Cajas de pizza con grasa": "🍕",
  "Cáscaras de huevo": "🥚",
  "Cáscaras de frutas": "🍌",
  "Cables y cargadores": "🔌",
  "Celulares viejos": "📱",
  "Cepillos de dientes": "🪥",
  "Cerámica rota": "🏺",
  Chicles: "🍬",
  "Colillas de cigarro": "🚬",
  "Cuadernos y hojas": "📓",
  "Envases de yogur": "🥛",
  "Envolturas de galletas y snacks": "🍪",
  "Focos ahorradores": "💡",
  "Frascos de mermelada": "🫙",
  "Hojas secas y poda": "🍂",
  Huesos: "🦴",
  "Latas de conserva": "🥫",
  "Latas de gaseosa": "🥤",
  Mascarillas: "😷",
  "Medicamentos vencidos": "💊",
  Pañales: "🧷",
  "Papel higiénico usado": "🧻",
  "Periódicos y revistas": "📰",
  "Pilas y baterías": "🔋",
  "Plumones y lapiceros": "🖊️",
  "Restos de comida": "🍲",
  "Ropa vieja": "👕",
  "Servilletas usadas": "🧻",
  "Tapitas de plástico": "🔘",
  Tecnopor: "🥡",
  Tetrapak: "🧃",
  "Termómetros de mercurio": "🌡️",
  "Toallas higiénicas": "🩹",
  "Bolsas de té e infusiones": "🍵",
  "Vasos descartables de plástico": "🥤",
  "Vasos de papel con cera": "🥤",
};

/** Índice A–Z para responder "¿dónde boto esto?". */
export const ITEMS: readonly WasteItem[] = [
  {
    name: "Aceite de cocina usado",
    bin: "peligroso",
    aliases: ["aceite", "manteca"],
    note: "En botella cerrada, a un punto de acopio. Nunca al desagüe.",
  },
  { name: "Aerosoles", bin: "peligroso", aliases: ["spray", "desodorante en spray", "insecticida"] },
  { name: "Aserrín sin tratar", bin: "organico" },
  { name: "Bolsas plásticas limpias", bin: "aprovechable", aliases: ["bolsa", "bolsitas"] },
  { name: "Borra de café", bin: "organico", aliases: ["cafe", "posos de cafe"] },
  {
    name: "Botellas de plástico PET",
    bin: "aprovechable",
    aliases: ["botella", "gaseosa", "agua mineral", "plastico", "pet"],
    note: "Vacías, enjuagadas y aplastadas.",
  },
  { name: "Botellas de vidrio", bin: "aprovechable", aliases: ["vidrio", "botella de cerveza", "botella de vino"] },
  { name: "Cajas de cartón", bin: "aprovechable", aliases: ["caja", "carton"], note: "Desarmadas y secas." },
  { name: "Cajas de pizza con grasa", bin: "no-aprovechable", aliases: ["pizza"], note: "La parte limpia de la tapa sí es aprovechable." },
  { name: "Cáscaras de huevo", bin: "organico", aliases: ["huevo"] },
  { name: "Cáscaras de frutas", bin: "organico", aliases: ["cascara", "platano", "naranja", "papa", "verduras"] },
  {
    name: "Cables y cargadores",
    bin: "peligroso",
    aliases: ["cable", "cargador", "audifonos"],
    note: "Son RAEE: llévalos a una campaña de acopio.",
  },
  {
    name: "Celulares viejos",
    bin: "peligroso",
    aliases: ["celular", "telefono", "movil", "tablet"],
    note: "Son RAEE: llévalos a una campaña de acopio.",
  },
  { name: "Cepillos de dientes", bin: "no-aprovechable", aliases: ["cepillo"] },
  { name: "Cerámica rota", bin: "no-aprovechable", note: "Envuelta en papel y marcada." },
  { name: "Chicles", bin: "no-aprovechable" },
  { name: "Colillas de cigarro", bin: "no-aprovechable" },
  { name: "Cuadernos y hojas", bin: "aprovechable", aliases: ["cuaderno", "hoja", "papel", "libreta"] },
  { name: "Envases de yogur", bin: "aprovechable", aliases: ["yogur", "yogurt"], note: "Enjuagados." },
  {
    name: "Envolturas de galletas y snacks",
    bin: "no-aprovechable",
    aliases: ["envoltura", "galleta", "papitas", "snack", "golosinas"],
    note: "Son metalizadas y no se reciclan.",
  },
  {
    name: "Focos ahorradores",
    bin: "peligroso",
    aliases: ["foco", "bombilla", "fluorescente"],
    note: "Contienen mercurio. No los rompas.",
  },
  { name: "Frascos de mermelada", bin: "aprovechable" },
  { name: "Hojas secas y poda", bin: "organico", aliases: ["hojas", "poda", "pasto", "ramas"] },
  { name: "Huesos", bin: "organico", aliases: ["hueso"], note: "Van con orgánicos, aunque no conviene ponerlos en la compostera casera." },
  { name: "Latas de conserva", bin: "aprovechable", aliases: ["lata", "atun", "conserva"], note: "Enjuagadas." },
  { name: "Latas de gaseosa", bin: "aprovechable", aliases: ["lata", "cerveza en lata"] },
  { name: "Mascarillas", bin: "no-aprovechable", aliases: ["barbijo", "tapabocas", "cubrebocas"] },
  { name: "Medicamentos vencidos", bin: "peligroso", aliases: ["medicina", "pastillas", "remedios", "jarabe"] },
  { name: "Pañales", bin: "no-aprovechable", aliases: ["panal", "pañal"] },
  { name: "Papel higiénico usado", bin: "no-aprovechable", aliases: ["papel higienico", "papel de baño"] },
  { name: "Periódicos y revistas", bin: "aprovechable", aliases: ["periodico", "diario", "revista"] },
  { name: "Pilas y baterías", bin: "peligroso", aliases: ["pila", "bateria"] },
  { name: "Plumones y lapiceros", bin: "no-aprovechable", aliases: ["plumon", "lapicero", "boligrafo", "lapiz"] },
  { name: "Restos de comida", bin: "organico", aliases: ["comida", "sobras"] },
  { name: "Ropa vieja", bin: "aprovechable", aliases: ["ropa", "tela", "zapatos"], note: "Si está en buen estado, mejor dónala." },
  { name: "Servilletas usadas", bin: "no-aprovechable", aliases: ["servilleta"] },
  { name: "Tapitas de plástico", bin: "aprovechable", aliases: ["tapa", "tapita"] },
  { name: "Tecnopor", bin: "no-aprovechable", aliases: ["tecnoport", "icopor", "plumavit", "poliestireno", "taper"] },
  { name: "Tetrapak", bin: "aprovechable", aliases: ["tetra pak", "caja de leche", "caja de jugo"], note: "Enjuagado y aplastado." },
  { name: "Termómetros de mercurio", bin: "peligroso", aliases: ["termometro", "mercurio"] },
  { name: "Toallas higiénicas", bin: "no-aprovechable", aliases: ["toalla higienica", "toallitas"] },
  { name: "Bolsas de té e infusiones", bin: "organico", aliases: ["te", "mate", "infusion", "anis"] },
  { name: "Vasos descartables de plástico", bin: "aprovechable", aliases: ["vaso", "descartable"], note: "Limpios." },
  { name: "Vasos de papel con cera", bin: "no-aprovechable", aliases: ["vaso de papel"] },
];
