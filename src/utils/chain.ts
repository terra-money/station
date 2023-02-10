export const isTerraChain = (chainID: string) => {
  return chainID.startsWith("phoenix-") || chainID.startsWith("pisco-")
}
