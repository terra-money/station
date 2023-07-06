import { useConnectedWallet } from "@terra-money/wallet-kit"
import { useNetworks } from "app/InitNetworks"
import { addressFromWords } from "utils/bech32"
import useAuth from "./useAuth"
import { useChainID, useNetwork, useNetworkWithFeature } from "./useNetwork"
import { ChainFeature } from "types/chains"

/* auth | walle-provider */
const useAddress = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  const chainID = useChainID()
  if (connected?.addresses[chainID]) {
    return connected?.addresses[chainID]
  }
  return wallet?.words?.["330"]
    ? addressFromWords(wallet.words["330"])
    : undefined
}
export const useAllInterchainAddresses = () => {
  const connected = useConnectedWallet()
  if (connected?.addresses) return connected.addresses
}

export const useInterchainAddresses = () => {
  const connected = useConnectedWallet()
  const { filterEnabledNetworks } = useNetworks()
  const networks = useNetwork()
  const { wallet } = useAuth()

  if (connected?.addresses) {
    return filterEnabledNetworks(connected.addresses)
  }

  const words = wallet?.words
  if (!words) return {}

  const addresses = Object.values(networks ?? {}).reduce(
    (acc, { prefix, coinType, chainID }) => {
      acc[chainID] = addressFromWords(words[coinType] as string, prefix)
      return acc
    },
    {} as Record<string, string>
  )
  return addresses
}

export const useInterchainAddressesWithFeature = (feature?: ChainFeature) => {
  const addresses = useInterchainAddresses()
  const networks = useNetworkWithFeature(feature)
  return Object.fromEntries(
    Object.entries(addresses).filter(([key, _]) => networks[key])
  )
}

export default useAddress
