import { AccAddress } from "@terra-money/feather.js"

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
