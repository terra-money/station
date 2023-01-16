export const getIsTerraChain = (chain: string) => {
  return chain.startsWith("phoenix-") || chain.startsWith("pisco-")
}
