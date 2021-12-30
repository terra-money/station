import { fromPairs } from "ramda"
import { WalletControllerChainOptions } from "@terra-money/wallet-provider"
import createContext from "utils/createContext"

export const [useNetworks, NetworksProvider] =
  createContext<TerraNetworks>("useNetworks")

export const convert = (options: WalletControllerChainOptions) => {
  const { walletConnectChainIds: ids } = options
  return fromPairs(Object.values(ids).map((item) => [item.name, item]))
}
