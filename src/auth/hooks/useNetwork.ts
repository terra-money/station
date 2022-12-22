import { atom, useRecoilState, useRecoilValue } from "recoil"
import { useNetworks } from "app/InitNetworks"
import { getStoredNetwork, storeNetwork } from "../scripts/network"
import { useWallet, WalletStatus } from "@terra-money/wallet-provider"
import { walletState } from "./useAuth"
import is from "../scripts/is"

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

export const useNetwork = (): Record<ChainID, InterchainNetwork> => {
  const { networks, filterEnabledNetworks } = useNetworks()
  const [network, setNetwork] = useNetworkState()
  const wallet = useRecoilValue(walletState)
  const connectedWallet = useWallet()

  // check connected wallet
  if (connectedWallet.status === WalletStatus.WALLET_CONNECTED) {
    if (network !== "mainnet" && "phoenix-1" in connectedWallet.network) {
      setNetwork("mainnet")
    } else if (network !== "testnet" && "pisco-1" in connectedWallet.network) {
      setNetwork("testnet")
    }

    return filterEnabledNetworks(
      connectedWallet.network as Record<ChainID, InterchainNetwork>
    )
  }

  // multisig wallet are supported only on terra
  if (is.multisig(wallet)) {
    const terra = Object.values(
      networks[network as NetworkName] as Record<ChainID, InterchainNetwork>
    ).find(({ prefix }) => prefix === "terra")
    if (!terra) return {}
    return filterEnabledNetworks({ [terra.chainID]: terra })
  }

  if (wallet && !wallet?.words?.["118"]) {
    const chains330 = Object.values(
      networks[network as NetworkName] as Record<ChainID, InterchainNetwork>
    ).filter(({ coinType }) => coinType === "330")

    return filterEnabledNetworks(
      chains330.reduce((acc, chain) => {
        acc[chain.chainID] = chain
        return acc
      }, {} as Record<ChainID, InterchainNetwork>)
    )
  }

  return filterEnabledNetworks(networks[network as NetworkName])
}

export const useNetworkName = () => {
  const network = useRecoilValue(networkState)
  return network
}

export const useChainID = () => {
  const network = useRecoilValue(networkState)
  return network === "mainnet" ? "phoenix-1" : "pisco-1"
}
