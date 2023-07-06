import { NetworkName } from "types/network"

export const getStoredNetwork = () => {
  return localStorage.getItem("network") ?? "mainnet"
}

export const storeNetwork = (network: NetworkName) => {
  localStorage.setItem("network", network)
}
