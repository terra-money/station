const isLocal = (
  wallet?: Wallet | LegacySingleWallet
): wallet is LocalWallet => {
  if (!wallet) return false
  return "name" in wallet
}

const isMultisig = (
  wallet?: Wallet | LegacySingleWallet
): wallet is MultisigWallet => {
  if (!isLocal(wallet)) return false
  return "multisig" in wallet
}

const isPreconfigured = (wallet?: Wallet): wallet is PreconfiguredWallet => {
  if (!isLocal(wallet)) return false
  return "mnemonic" in wallet
}

const isSingle = (wallet?: Wallet): wallet is SingleWallet => {
  if (!isLocal(wallet)) return false
  return !isPreconfigured(wallet) && !isMultisig(wallet) && !isLedger(wallet)
}

const isLedger = (
  wallet?: Wallet | LegacySingleWallet
): wallet is LedgerWallet => {
  if (!wallet) return false
  return "ledger" in wallet
}

const is = {
  local: isLocal,
  preconfigured: isPreconfigured,
  multisig: isMultisig,
  single: isSingle,
  ledger: isLedger,
}

export default is
