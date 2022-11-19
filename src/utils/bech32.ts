import { AccAddress } from "@terra-money/station.js"

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
