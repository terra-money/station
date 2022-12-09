import { atom, useRecoilState, useRecoilValue } from "recoil"
import { useNetworks } from "app/InitNetworks"
import { getStoredNetwork, storeNetwork } from "../scripts/network"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"
import { sandbox } from "../scripts/env"

const networkState = atom({
  key: "network",
  default: getStoredNetwork(),
})

export const useNetworkState = () => {
  const [storedNetwork, setNetwork] = useRecoilState(networkState)

  const changeNetwork = (network: NetworkName) => {
    if (network !== storedNetwork) {
      setNetwork(network)
      storeNetwork(network)
    }
  }

  return [storedNetwork, changeNetwork] as const
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

  if (sandbox || wallet.status !== WalletStatus.WALLET_CONNECTED) {
    if (networks[network]) {
      return networks[network]
    } else {
      setNetwork("mainnet")
      return networks.mainnet
    }
  }

  if (wallet.network["phoenix-1"] && network !== "mainnet") {
    setNetwork("mainnet")
  } else if (wallet.network["pisco-1"] && network !== "testnet") {
    setNetwork("testnet")
  }
  return wallet.network as unknown as Record<string, InterchainNetwork>
}

export const useNetworkName = () => {
  const network = useRecoilValue(networkState)
  return network
}

export const useChainID = () => {
  const network = useRecoilValue(networkState)
  return network === "mainnet" ? "phoenix-1" : "pisco-1"
}
