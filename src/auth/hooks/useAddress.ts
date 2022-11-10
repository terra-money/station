import { useConnectedWallet } from "@terra-money/use-wallet"
import { bech32 } from "bech32"
import useAuth from "./useAuth"

/* auth | walle-provider */
const useAddress = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  return wallet?.address ?? connected?.terraAddress
}

// TODO: fetch from assets.terra.money
const prefixes = ["terra", "osmo"]

export const useInterchainAddresses = () => {
  const connected = useConnectedWallet()
  const { wallet } = useAuth()
  const address = wallet?.address ?? connected?.terraAddress
  if (!address) return []
  const { words } = bech32.decode(address)
  const addresses = prefixes.map((prefix) => bech32.encode(prefix, words))
  console.log(addresses)
  return addresses
}

export default useAddress
