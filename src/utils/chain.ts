export const isTerraChain = (chainID: string) => {
  return chainID.startsWith("phoenix-") || chainID.startsWith("pisco-")
}

export const isAxelarChain = (chainID: string) => {
  return chainID.startsWith("axelar-dojo-")
}
