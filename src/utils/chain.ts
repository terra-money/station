export const isTerraChain = (chain: string) => {
  return chain.startsWith("phoenix-") || chain.startsWith("pisco-")
}
