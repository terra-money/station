// Alliance Protocol is composed by two smart contracts deployed on Terra :
//  Oracle: terra1jf3nndysevley5p3wnajkjvjxcql9d00gpj4en3xwp7yrkrdqess48rr27
//  Hub: terra1majrm6e6n0eg760n9fs4g5jvwzh4ytp8e2d99mfgzv2e7mjmdwxse0ty73
// AH stands for Alliance Hub
// AO stands for Alliance Oracle

import { Rewards } from "@terra-money/feather.js"

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
  [propName: string]: Array<NativeAssetInfo>
}

export interface AHStakedBalanceReq {
  address: string
}

export type AHStakedBalancesRes = AHStakedBalance[]
export interface AHStakedBalance {
  asset: NativeAssetInfo
  balance: string
}

export type AHAllRewards = AHRewards[]
export interface AHRewards {
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

export interface AllianceProtocolPendingRewards extends Rewards {
  staked_asset: string
}
