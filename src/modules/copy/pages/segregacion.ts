import { definePage } from "../domain/define";
import { button, heading, line, para, seo } from "./common";

export const SEGREGACION = definePage({
  label: "Segregación",
  path: "/segregacion",
  sections: {
    seo: seo(
      "Segregación en la fuente",
      "Qué va en la bolsa verde, marrón, negra y roja según la NTP 900.058:2019, días de recojo, un juego para practicar y un buscador para saber dónde botar cada objeto.",
    ),
    hero: {
      label: "Cabecera",
      fields: {
        eyebrow: line("Antetítulo", "Segregación en la fuente", 80),
        title: line("Titular", "Separa tus residuos en", 80),
        mark: line("Final del titular (subrayado con los colores)", "cuatro colores", 40),
        lede: para(
          "Entradilla",
          "El 84 % de lo que bota un hogar puneño se puede aprovechar. Para lograrlo, cada residuo tiene que salir de casa en la bolsa correcta.",
          400,
        ),
        button: button("¿Dónde va esto?", "Botón principal"),
        secondary: button("Juega y aprende", "Botón secundario"),
      },
    },
    bolsa: heading("Qué hay en la bolsa", { eyebrow: "Puno en cifras", title: "¿Qué hay en la bolsa de basura de tu casa?" }),
    juego: heading("Juego", {
      eyebrow: "Juega y aprende",
      title: "¿En qué bolsa va?",
      lede: "Pon a prueba lo que sabes del código de colores",
    }),
    buscador: heading("Buscador", {
      eyebrow: "Buscador",
      title: "¿Dónde va esto?",
      lede: "Escribe un objeto o recorre el índice. Si algo no aparece y tienes dudas, va en la bolsa negra.",
    }),
    programa: {
      ...heading(
        "Programa de la bolsa verde",
        { eyebrow: "Programa de segregación y recolección selectiva", title: "Así funciona la bolsa verde" },
        { button: button("Días de recojo de mi ruta") },
      ),
      list: {
        itemLabel: "Paso",
        items: [
          {
            title: "Te visita un promotor ambiental",
            text: "Un promotor de la Municipalidad pasa por tu vivienda y te explica cómo separar los residuos aprovechables.",
          },
          {
            title: "Recibes tu bolsa verde",
            text: "Si tu hogar se suma al programa, recibes una bolsa verde para papel, cartón, botellas, latas y vidrio limpios y secos.",
          },
          {
            title: "Pasa el recojo selectivo",
            text: "El vehículo de recolección selectiva pasa el día y la hora que te indica el promotor. Lo recuperado llega a recicladores formalizados.",
          },
        ],
      },
    },
    habitos: {
      ...heading("Hábitos", { eyebrow: "Buenas prácticas", title: "Cuatro hábitos que hacen la diferencia" }),
      list: {
        itemLabel: "Hábito",
        items: [
          { title: "Vacía y enjuaga", text: "Los envases sucios contaminan el papel y el cartón de la misma bolsa." },
          { title: "Aplasta", text: "Botellas, latas y cajas aplastadas ocupan menos en tu casa y en el camión." },
          { title: "Escurre los orgánicos", text: "Menos líquido es menos olor, menos moscas y un mejor compost." },
          { title: "Saca la bolsa a tiempo", text: "Solo cuando el camión está por pasar, nunca en la esquina antes de hora." },
        ],
      },
    },
    camion: {
      label: "Llamado final",
      fields: {
        title: line("Titular", "¿Qué día pasa el camión por tu calle?", 100),
        text: line("Texto", "Busca tu calle y mira el horario de tu ruta, en vivo.", 200),
        button: button("Ver rutas y horarios"),
      },
    },
  },
});
