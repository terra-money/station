type NetworkName = string
type TerraNetworks = Record<NetworkName, TerraNetwork>

interface TerraNetwork {
  name: NetworkName
  chainID: string
  lcd: string
}

type CustomNetworks = Record<NetworkName, CustomNetwork>

interface CustomNetwork extends TerraNetwork {
  preconfigure?: boolean
}
