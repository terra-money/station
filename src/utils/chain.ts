type ChainId = string
type ChainPrefix = string

export const isTerraChain = (id: ChainId | ChainPrefix) =>
  id.startsWith("phoenix-") || id.startsWith("pisco-") || id === "terra"
