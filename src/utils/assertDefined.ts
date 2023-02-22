export function assertDefined<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) {
    throw new Error("Value is undefined")
  }

  return value
}
