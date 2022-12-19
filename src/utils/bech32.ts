import { AccAddress } from "@terra-money/feather.js"
import { bech32 } from "bech32"

export function getChainIDFromAddress(
  address: AccAddress,
  chains: Record<
    string,
    {
      chainID: string
      prefix: string
    }
  >
) {
  const addressPrefix = AccAddress.getPrefix(address)
  return Object.values(chains).find(({ prefix }) => prefix === addressPrefix)
    ?.chainID
}

export function addressFromWords(words: string, prefix = "terra") {
  return bech32.encode(prefix, Buffer.from(words, "hex"))
}

export function wordsFromAddress(address: AccAddress) {
  return Buffer.from(bech32.decode(address).words).toString("hex")
}
