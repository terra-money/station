export const getMaxHeightStyle = (
  maxHeight: number | boolean | undefined,
  initial?: number
) => {
  if (!maxHeight) return

  return {
    maxHeight: typeof maxHeight === "number" ? maxHeight : initial,
    overflowY: "auto" as const,
  }
}
