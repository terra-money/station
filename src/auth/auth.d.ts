type Bip = 118 | 330

type Wallet = SingleWallet | MultisigWallet | LedgerWallet
type LocalWallet = SingleWallet | MultisigWallet // wallet with name

interface SingleWallet {
  address: string
  name: string
}

interface MultisigWallet extends SingleWallet {
  multisig: true
}

interface LedgerWallet {
  address: string
  ledger: true
}

interface StoredWallet extends SingleWallet {
  encrypted: string
}

interface StoredWalletLegacy extends SingleWallet {
  wallet: string
}
