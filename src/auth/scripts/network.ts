export const getStoredNetwork = () => {
  return localStorage.getItem("network") ?? "classic"
}

export const storeNetwork = (network: NetworkName) => {
  localStorage.setItem("network", network)
}
