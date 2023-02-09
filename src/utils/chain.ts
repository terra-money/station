export const isTerraChain = (chainID: string) => {
  return chainID.startsWith("phoenix-") || chainID.startsWith("pisco-")
}

// export const getTerraChainIDs = (chains: InterchainNetwork) => {
//     return Object.values(chains)
//       .map(group => Object.values(group))
//       .flat()
//       .filter(chain => chain.prefix === 'terra')
//       .map(chain => chain.chainID);

// }
