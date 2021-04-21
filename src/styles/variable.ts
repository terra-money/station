const variable = (key: string) =>
  getComputedStyle(document.body).getPropertyValue(key)

export default variable
