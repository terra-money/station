type TerraAddress = string

type Amount = string
type Value = string | number
type Price = number

/* coin | token */
type CoinDenom = string // uluna | uusd
type IBCDenom = string // ibc/...
type TokenAddress = TerraAddress
type Denom = CoinDenom | IBCDenom
type Token = Denom | TokenAddress

/* asset info */
interface Asset {
  amount: Amount
  info: AssetInfo
}

type AssetInfo = AssetInfoNativeToken | AssetInfoCW20Token

interface AssetInfoNativeToken {
  native_token: { denom: Denom }
}

interface AssetInfoCW20Token {
  token: { contract_addr: TerraAddress }
}

/* token item */
interface TokenItem {
  token: string
  decimals: number
  symbol: string
  type?: string
  name?: string
  icon?: string
  isAxelar?: boolean
  lsd?: string
}

interface TokenItemWithBalance extends TokenItem {
  balance: string
}

/* native */
interface CoinData {
  amount: Amount
  denom: Denom
}

/* ibc */
type IBCWhitelist = Record<string, IBCTokenItem>

interface IBCTokenInfoResponse {
  path: string
  base_denom: string
}

interface IBCTokenItem extends IBCTokenInfoResponse {
  denom: string
  symbol: string
  name: string
  icon: string
  decimals?: number
}

/* cw20 */
type CW20Contracts = Record<TerraAddress, CW20ContractItem>
type CW20Whitelist = Record<TerraAddress, CW20TokenItem>
type NativeWhitelist = Record<CoinDenom, NativeTokenItem>

interface CW20ContractItem {
  protocol: string
  name: string
  icon: string
}

interface CW20TokenInfoResponse {
  symbol: string
  name: string
  decimals: number
}

interface CW20TokenItem extends CW20TokenInfoResponse {
  token: TerraAddress
  protocol?: string
  icon?: string
}

interface NativeTokenItem {
  chains: string[]
  decimals: number
  icon: string
  name: string
  symbol: string
  token: CoinDenom
}

/* cw20: pair */
type CW20Pairs = Record<TerraAddress, PairDetails>
type Dex = "terraswap" | "astroport"
type PairType = "xyk" | "stable"
interface PairDetails {
  dex: Dex
  type: PairType
  assets: Pair
}

type Pair = [Token, Token]

/* cw721 */
interface CW721ContractInfoResponse {
  name: string
  symbol: string
  decimals: number
}

interface CW721ContractItem extends CW721ContractInfoResponse {
  contract: TerraAddress
  protocol?: string
  icon?: string
  homepage?: string
  marketplace?: string[]
}

type CW721Whitelist = Record<TerraAddress, CW721ContractItem>

interface NFTTokenItem {
  token_uri?: string
  extension?: Extension
}

interface Extension {
  name?: string
  description?: string
  image?: string
}
