export const toBase64 = (object: object) => {
  try {
    return Buffer.from(JSON.stringify(object)).toString("base64")
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
export const toHump = (name: string) => {
  return name.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase())
}
