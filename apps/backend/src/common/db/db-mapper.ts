export const toNumNullable = (
  v: string | number | null | undefined,
): number | null => (v == null ? null : Number(v));

export const toNum0 = (v: string | number | null | undefined): number =>
  v == null ? 0 : Number(v);
