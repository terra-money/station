import { wordsFromAddress } from "utils/bech32"
import preconfigured from "../../config/preconfigured.json"

const usePreconfigured = () => {
  return preconfigured.map(({ mnemonic, address, name }) => ({
    mnemonic,
    name,
    words: { 330: wordsFromAddress(address) },
  })) as PreconfiguredWallet[]
}

export default usePreconfigured
