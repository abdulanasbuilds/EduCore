export type GradingScale = {
  min: number;
  label: string;
};

export const DEFAULT_LETTER_SCALE: GradingScale[] = [
  { min: 90, label: "A+" },
  { min: 80, label: "A" },
  { min: 75, label: "B+" },
  { min: 70, label: "B" },
  { min: 65, label: "C+" },
  { min: 60, label: "C" },
  { min: 55, label: "D+" },
  { min: 50, label: "D" },
  { min: 0, label: "F" },
];

export function getGradeLetter(scorePercent: number, scale = DEFAULT_LETTER_SCALE): string {
  const score = Math.max(0, Math.min(100, Number(scorePercent) || 0));
  return scale.find((item) => score >= item.min)?.label ?? "F";
}

export function calculateWeightedPercentage(
  items: Array<{ score: number; maxScore: number; weight: number; group?: string }>
): number {
  const valid = items.filter(
    (item) =>
      Number.isFinite(item.score) &&
      Number.isFinite(item.maxScore) &&
      item.maxScore > 0 &&
      Number.isFinite(item.weight) &&
      item.weight > 0
  );
  if (!valid.length) return 0;

  const groups = new Map<string, { percentages: number[]; weight: number }>();
  valid.forEach((item, index) => {
    const key = item.group || `item-${index}`;
    const entry = groups.get(key) || { percentages: [], weight: item.weight };
    entry.percentages.push((item.score / item.maxScore) * 100);
    entry.weight = item.weight;
    groups.set(key, entry);
  });

  const totalWeight = [...groups.values()].reduce((sum, group) => sum + group.weight, 0);
  if (totalWeight <= 0) return 0;

  const weighted = [...groups.values()].reduce((sum, group) => {
    const componentAverage = group.percentages.reduce((a, b) => a + b, 0) / group.percentages.length;
    return sum + componentAverage * group.weight;
  }, 0);

  return Math.round((weighted / totalWeight) * 100) / 100;
}

export function calculateSimplePercentage(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 10000) / 100;
}
