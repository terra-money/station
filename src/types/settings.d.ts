/* Address book */
interface AddressBook {
  name: string
  recipient: string
  memo?: string
}

/* Tokens */
type CustomTokens = Record<NetworkName, CustomTokensByNetwork>

interface CustomTokensByNetwork {
  ibc: IBCTokenInfoResponse[]
  cw20: CW20TokenInfoResponse[]
  cw721: CW721ContractInfoResponse[]
}

type CustomToken = CustomTokenCW20 | CustomTokenCW721 | CustomTokenIBC
interface CustomTokenIBC extends IBCTokenItem {
  denom: IBCDenom
}

interface CustomTokenCW20 extends CW20TokenInfoResponse {
  token: TerraAddress
}

interface CustomTokenCW721 extends CW721ContractInfoResponse {
  contract: TerraAddress
}
