import { AccAddress } from "@terra-money/feather.js"
import { useCustomTokensIBC } from "data/settings/CustomTokens"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useCW20Whitelist } from "data/Terra/TerraAssets"
import { useTokenInfoCW20 } from "data/queries/wasm"
import { Fetching } from "components/feedback"
import WithSearchInput from "./WithSearchInput"
import TokenList from "./TokenList"

interface Props {
  whitelist: { cw20: CW20Whitelist }
  keyword: string
}

const Component = ({ whitelist, keyword }: Props) => {
  const ibc = useCustomTokensIBC()
  const cw20 = useCustomTokensCW20()

  type AddedIBC = Record<string, CustomTokenIBC>
  type AddedCW20 = Record<TerraAddress, CustomTokenCW20>
  const added = {
    ibc: ibc.list.reduce<AddedIBC>(
      (acc, item) => ({ ...acc, [item.denom.replace("ibc/", "")]: item }),
      {}
    ),
    cw20: cw20.list.reduce<AddedCW20>(
      (acc, item) => ({ ...acc, [item.token]: item }),
      {}
    ),
  }

  const merged = {
    ...added.cw20,
    ...whitelist.cw20,
  }

  // if listed
  const listedItem = merged[keyword]

  // if not listed
  const { data: tokenInfo, ...state } = useTokenInfoCW20(
    !listedItem ? keyword : ""
  )

  const responseItem = tokenInfo ? { token: keyword, ...tokenInfo } : undefined

  // conclusion
  const result = listedItem ?? responseItem

  const results = AccAddress.validate(keyword)
    ? result
      ? [result]
      : []
    : Object.values(merged).filter((item) => {
        const { symbol, name } = item
        return [symbol, name].some((word) =>
          word?.toLowerCase().includes(keyword.toLowerCase())
        )
      })

  const manage = {
    list: [...ibc.list, ...cw20.list],
    getIsAdded: (item: CustomTokenIBC | CustomTokenCW20) => {
      if ("base_denom" in item) return ibc.getIsAdded(item)
      else return cw20.getIsAdded(item)
    },
    add: (item: CustomTokenIBC | CustomTokenCW20) => {
      if ("base_denom" in item) return ibc.add(item)
      else return cw20.add(item)
    },
    remove: (item: CustomTokenIBC | CustomTokenCW20) => {
      if ("base_denom" in item) return ibc.remove(item)
      else return cw20.remove(item)
    },
  }

  const renderTokenItem = (item: CustomTokenIBC | CustomTokenCW20) => {
    if ("base_denom" in item) {
      const { symbol, denom, ...rest } = item
      return { ...rest, token: denom, title: symbol, key: denom }
    } else {
      const { token, symbol, ...rest } = item
      return { ...rest, token, title: symbol, contract: token, key: token }
    }
  }

  return (
    <TokenList
      {...state}
      {...manage}
      results={results}
      renderTokenItem={renderTokenItem}
    />
  )
}

const ManageCustomTokens = () => {
  //const { data: ibc, ...ibcWhitelistState } = useIBCWhitelist()
  const { data: cw20, ...cw20WhitelistState } = useCW20Whitelist()

  const render = () => {
    if (!cw20) return null

    return (
      <WithSearchInput>
        {(input) => <Component whitelist={{ cw20 }} keyword={input} />}
      </WithSearchInput>
    )
  }

  return (
    <Fetching {...cw20WhitelistState} height={2}>
      {render()}
    </Fetching>
  )
}

export default ManageCustomTokens
