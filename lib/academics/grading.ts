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
  items: Array<{ score: number; maxScore: number; weight: number }>
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

  const totalWeight = valid.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) return 0;

  const weighted = valid.reduce((sum, item) => {
    const percentage = (item.score / item.maxScore) * 100;
    return sum + percentage * item.weight;
  }, 0);

  return Math.round((weighted / totalWeight) * 100) / 100;
}

export function calculateSimplePercentage(score: number, maxScore: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 10000) / 100;
}
