type Bip = 118 | 330

interface Wallet {
  name: string
  address: string
}

interface LedgerWallet {
  address: string
  ledger: true
}

interface StoredWallet extends Wallet {
  encrypted: string
}

interface StoredWalletLegacy extends Wallet {
  wallet: string
}
