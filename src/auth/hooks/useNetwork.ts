import { atom, useRecoilState, useRecoilValue } from "recoil"
import { useWallet } from "@terra-money/wallet-provider"
import { useNetworks } from "app/NetworksProvider"
import { electron } from "../scripts/env"
import { getStoredNetwork, storeNetwork } from "../scripts/network"

const networkState = atom({
  key: "network",
  default: getStoredNetwork(),
})

export const useNetworkState = () => {
  const [network, setNetwork] = useRecoilState(networkState)

  const changeNetwork = (network: NetworkName) => {
    setNetwork(network)
    storeNetwork(network)
  }

  return [network, changeNetwork] as const
}

/* helpers */
export const useNetworkOptions = () => {
  const networks = useNetworks()

  if (!electron) return

  return Object.values(networks).map(({ name }) => {
    return { value: name, label: name }
  })
}

export const useNetwork = () => {
  const networks = useNetworks()
  const network = useRecoilValue(networkState)
  const wallet = useWallet()
  return electron ? networks[network] : wallet.network
}

export const useNetworkName = () => {
  const { name } = useNetwork()
  return name
}

export const useChainID = () => {
  const { chainID } = useNetwork()
  return chainID
}
