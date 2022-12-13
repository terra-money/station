export function useWalletProvider() {
  return walletPrivider()
}
export function walletPrivider() {
  return window.misesWallet || window.misesEthereum || window.ethereum
}