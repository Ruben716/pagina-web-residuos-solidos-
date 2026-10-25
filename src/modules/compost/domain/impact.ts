import { WASTE_FACTS } from "@/shared/content/facts";

const DAYS_PER_MONTH = 30.4;
/** Rendimiento típico del compostaje doméstico: ~30 % del peso fresco termina como abono maduro. */
export const COMPOST_YIELD = 0.3;
/** Peso aproximado de una bolsa de basura doméstica llena. */
const KG_PER_BAG = 5;

export function compostImpact(people: number) {
  const organicPerMonth = people * WASTE_FACTS.kgPerPersonPerDay * WASTE_FACTS.organicShare * DAYS_PER_MONTH;
  const compostPerMonth = organicPerMonth * COMPOST_YIELD;
  return {
    organicPerMonth,
    compostPerMonth,
    organicPerYear: organicPerMonth * 12,
    bagsPerYear: Math.round((organicPerMonth * 12) / KG_PER_BAG),
  };
}
