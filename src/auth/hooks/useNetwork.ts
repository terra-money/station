import { atom, useRecoilState } from "recoil"
import { useNetworks } from "app/InitNetworks"
import { getStoredNetwork, storeNetwork } from "../scripts/network"
import { useWallet } from "@terra-money/wallet-provider"
import { sandbox } from "../scripts/env"

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
  return [
    { value: "mainnet", label: "mainnet" },
    { value: "testnet", label: "testnet" },
  ]
}

export const useNetwork = () => {
  const networks = useNetworks()
  const [network, setNetwork] = useNetworkState()
  const wallet = useWallet()

  if (sandbox) return networks[network] ?? networks.mainnet

  if (
    Object.keys(wallet.network).find((chainID) =>
      chainID.startsWith("phoenix-")
    ) &&
    network !== "mainnet"
  ) {
    setNetwork("mainnet")
  } else if (network !== "testnet") {
    setNetwork("testnet")
  }
  return wallet.network as unknown as Record<string, InterchainNetwork>
}

export const useNetworkName = () => {
  const [network] = useNetworkState()
  return network
}

export const useChainID = () => {
  const [network] = useNetworkState()
  return network === "mainnet" ? "phoenix-1" : "pisco-1"
}
