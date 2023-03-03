type ChainId = string
type ChainPrefix = string

export const isTerraChain = (id: ChainId | ChainPrefix) =>
  id.startsWith("phoenix-") || id.startsWith("pisco-") || id === "terra"

export const isOsmosisChain = (id: ChainId | ChainPrefix) =>
  id.startsWith("osmosis-") || id === "osmo"

export const sortChainsToFront = (chains: ChainId[]) => {
  return chains.filter(isTerraChain).concat(
    chains.filter(isOsmosisChain),
    chains.filter((chain) => !isTerraChain(chain) && !isOsmosisChain(chain))
  )
}
