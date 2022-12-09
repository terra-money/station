import { useConnectedWallet } from "@terra-money/use-wallet"
import { bech32 } from "bech32"
import useAuth from "./useAuth"
import { useNetwork } from "./useNetwork"

/* auth | walle-provider */
const useAddress = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  return (
    wallet?.address ??
    connected?.addresses["phoenix-1"] ??
    connected?.addresses["pisco-1"]
  )
}

export const useInterchainAddresses = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  const networks = useNetwork()

  if (connected?.addresses) {
    return connected.addresses
  }

  const address = wallet?.address
  if (!address) return
  const { words } = bech32.decode(address)

  const addresses = Object.values(networks).reduce(
    (acc, { prefix, chainID }) => {
      acc[chainID] = bech32.encode(prefix, words)
      return acc
    },
    {} as Record<string, string>
  )

  return addresses
}

export default useAddress
