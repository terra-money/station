import { useWallet } from "@terra-money/wallet-provider"
export { useAddress } from "auth"

export const useNetwork = () => {
  const { network } = useWallet()
  return network
}

export const useNetworkName = () => {
  const { network } = useWallet()
  return network.name
}

export const useChainID = () => {
  const { network } = useWallet()
  return network.chainID
}
