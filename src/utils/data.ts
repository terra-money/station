export const toBase64 = (object: object) => {
  try {
    return Buffer.from(JSON.stringify(object)).toString("base64")
  } catch (error) {
    return ""
  }
}

export const fromBase64 = (value: string): string => {
  try {
    return Buffer.from(value, "base64").toString()
  } catch (error) {
    return ""
  }
}

export const parseJSON = (query: string) => {
  try {
    return JSON.parse(query)
  } catch {
    return
  }
}

export const validateMsg = (msg: string): object | undefined => {
  const parsed = parseJSON(msg)
  if (!parsed) return
  return parsed
}
