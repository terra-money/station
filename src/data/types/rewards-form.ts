import { Coin } from "@terra-money/feather.js"

export const DefaultRewardsListing = (): RewardsListing => {
  return {
    byValidator: [],
    total: {
      sum: "0",
      list: [],
    },
  }
}

export interface RewardsListing {
  byValidator: Array<RewardsListingByVal>
  total: RewardsListingTotal
}

export interface RewardsListingByVal {
  // Property available only for the Alliance Protocol
  // because you can stake 1 type of asset to receive
  // rewards for another type of asset. When claiming
  // rewards you must claim with the stakedAsset.
  stakedAsset?: string
  address: string
  sum: string
  list: Coin.Data[]
}

export interface RewardsListingTotal {
  sum: string
  list: Coin.Data[]
}
