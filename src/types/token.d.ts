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
  token: TerraAddress
  decimals: number
  symbol: string
  name?: string
  icon?: string
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
}

/* cw20 */
type CW20Whitelist = Record<TerraAddress, CW20TokenItem>

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

/* cw20: pair */
type CW20Pairs = Record<TerraAddress, Pair>
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
  extension?: Extension
}

interface Extension {
  name?: string
  description?: string
  image?: string
}
