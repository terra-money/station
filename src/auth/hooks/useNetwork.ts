import { atom, useRecoilState, useRecoilValue } from "recoil"
import { useWallet } from "@terra-money/wallet-provider"
import { useNetworks } from "app/InitNetworks"
import { sandbox } from "../scripts/env"
import { getStoredNetwork, storeNetwork } from "../scripts/network"
import { RN_APIS, WebViewMessage } from "utils/rnModule"
import { isWallet } from "auth"
import { capitalize } from "@mui/material"
import { useSessionsState } from "./useSessions"

const networkState = atom({
  key: "network",
  default: getStoredNetwork(),
})

export const useNetworkState = () => {
  const [network, setNetwork] = useRecoilState(networkState)
  const [sessions, , disconnectAll] = useSessionsState()

  const changeNetwork = (network: NetworkName) => {
    if (isWallet.mobileNative()) {
      WebViewMessage(RN_APIS.SET_NETWORK, network)
    }
    if (sessions) {
      disconnectAll()
    }
    setNetwork(network)
    storeNetwork(network)
  }

  return [network, changeNetwork] as const
}

/* helpers */
export const useNetworkOptions = () => {
  const networks = useNetworks()

  if (!sandbox) return

  return Object.values(networks).map(({ name }) => {
    return { value: name, label: capitalize(name) }
  })
}

export const useNetwork = (): CustomNetwork => {
  const networks = useNetworks()
  const network = useRecoilValue(networkState)
  const wallet = useWallet()

  if (sandbox) return networks[network] ?? networks.mainnet
  return wallet.network
}

export const useNetworkName = () => {
  const { name } = useNetwork()
  return name
}

export const useChainID = () => {
  const { chainID } = useNetwork()
  return chainID
}
