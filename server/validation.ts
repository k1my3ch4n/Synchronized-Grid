// 숫자 검증 헬퍼
export const isValidNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export const isInRange = (v: number, min: number, max: number) =>
  v >= min && v <= max;
