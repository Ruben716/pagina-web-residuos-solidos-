import { z } from "zod";
import type { CollectionView } from "@/modules/content";
import { type Faq, FAQS } from "../data";

export const FAQ_KEY = "faq";
export const FAQ_TOPICS = ["Recolección", "Segregación", "Compostaje", "Reportes"] as const;

const req = (msg: string) => z.string().trim().min(1, msg);

export const faqSchema = z
  .array(
    z.object({
      id: req("Falta el identificador."),
      topic: z.enum(FAQ_TOPICS, "Elige un tema."),
      question: req("Escribe la pregunta.").max(200),
      answer: req("Escribe la respuesta.").max(1500),
    }),
  )
  .min(1, "Debe quedar al menos una pregunta.") satisfies z.ZodType<Faq[]>;

export const FAQ_VIEW: CollectionView = {
  key: FAQ_KEY,
  title: "Preguntas frecuentes",
  description: "Preguntas y respuestas de la página Preguntas. El orden de la lista es el orden en el sitio, dentro de cada tema.",
  itemName: "pregunta",
  titleField: "question",
  subtitleField: "topic",
  idField: "id",
  where: "/preguntas",
  blank: { topic: "Recolección", question: "", answer: "" },
  fields: [
    { type: "select", name: "topic", label: "Tema", options: FAQ_TOPICS.map((t) => ({ value: t, label: t })) },
    { type: "text", name: "question", label: "Pregunta" },
    { type: "textarea", name: "answer", label: "Respuesta", rows: 6 },
  ],
};

export const FAQ_DEFAULTS: Faq[] = [...FAQS];
