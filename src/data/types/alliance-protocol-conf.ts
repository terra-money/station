// Alliance Protocol is composed by two smart contracts deployed on Terra :
//  Oracle: terra1jf3nndysevley5p3wnajkjvjxcql9d00gpj4en3xwp7yrkrdqess48rr27
//  Hub: terra1majrm6e6n0eg760n9fs4g5jvwzh4ytp8e2d99mfgzv2e7mjmdwxse0ty73
// AH stands for Alliance Hub
// AO stands for Alliance Oracle

export const ChainID = String

export interface AHConfig {
  governance: string
  controller: string
  oracle: string
  last_reward_update_timestamp: string
  alliance_token_denom: string
  alliance_token_supply: string
  reward_denom: string
}

export interface AHWhitelistedAssets {
  [propName: ChainID]: Array<NativeAssetInfo>
}

export interface AHStakedBalanceReq {
  address: string
}

export type AHStakedBalancesRes = AHStakedBalance[]
export interface AHStakedBalance {
  asset: NativeAssetInfo
  balance: string
}

export interface AHAllPendingRewardsQueryReq {
  address: string
}

export type AHAllPendingRewardsQueryRes = AHAllPendingRewardQueryRes[]
export interface AHAllPendingRewardQueryRes {
  staked_asset: NativeAssetInfo
  reward_asset: NativeAssetInfo
  rewards: string
}

export interface NativeAssetInfo {
  native: string
}

export interface AOConfig {
  data_expiry_seconds: number
  governance_addr: string
  controller_addr: string
}
