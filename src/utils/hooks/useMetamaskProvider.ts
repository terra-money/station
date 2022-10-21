export function useMetamaskProvider() {
  return window.misesEthereum || window.ethereum
}
