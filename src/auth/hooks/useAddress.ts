import { useConnectedWallet } from "@terra-money/use-wallet"
import { useNetworks } from "app/InitNetworks"
import { addressFromWords } from "utils/bech32"
import useAuth from "./useAuth"
import { useChainID } from "./useNetwork"
import { useAllNetworks } from "data/wallet"

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
  const interchainAddresses = useAllInterchainAddresses()
  const { filterEnabledNetworks } = useNetworks()
  const networks = useAllNetworks()
  const { wallet } = useAuth()

  if (interchainAddresses) return filterEnabledNetworks(interchainAddresses)

  const words = wallet?.words
  if (!words) return

  const addresses = Object.values(networks).reduce(
    (acc, { prefix, coinType, chainID }) => {
      acc[chainID] = addressFromWords(words[coinType] as string, prefix)
      return acc
    },
    {} as Record<string, string>
  )
  return addresses
}

export default useAddress
