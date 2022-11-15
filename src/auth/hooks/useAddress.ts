import { useConnectedWallet } from "@terra-money/use-wallet"
import { bech32 } from "bech32"
import { useChains } from "data/queries/chains"
import useAuth from "./useAuth"

/* auth | walle-provider */
const useAddress = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  return wallet?.address ?? connected?.terraAddress
}

export const useInterchainAddresses = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  const chains = useChains()

  const address = wallet?.address ?? connected?.terraAddress
  if (!address) return {}
  const { words } = bech32.decode(address)

  const addresses = Object.values(chains).reduce((acc, { prefix, chainID }) => {
    acc[chainID] = bech32.encode(prefix, words)
    return acc
  }, {} as Record<string, string>)

  return addresses
}

export default useAddress
