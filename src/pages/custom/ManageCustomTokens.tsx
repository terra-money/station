import { AccAddress } from "@terra-money/feather.js"
import {
  useCustomTokensIBC,
  useCustomTokensNative,
} from "data/settings/CustomTokens"
import { useCustomTokensCW20 } from "data/settings/CustomTokens"
import { useCW20Whitelist } from "data/Terra/TerraAssets"
import { useTokenInfoCW20 } from "data/queries/wasm"
import { Fetching } from "components/feedback"
import WithSearchInput from "./WithSearchInput"
import TokenList from "./TokenList"
import { useWhitelist } from "data/queries/chains"
import { useNetworkName } from "data/wallet"

interface Props {
  whitelist: { cw20: CW20Whitelist; native: NativeWhitelist }
  keyword: string
}

const Component = ({ whitelist, keyword }: Props) => {
  const ibc = useCustomTokensIBC()
  const cw20 = useCustomTokensCW20()
  const native = useCustomTokensNative()

  type AddedIBC = Record<string, CustomTokenIBC>
  type AddedCW20 = Record<TerraAddress, CustomTokenCW20>
  type AddedNative = Record<CoinDenom, CustomTokenNative>
  const added = {
    ibc: ibc.list.reduce<AddedIBC>(
      (acc, item) => ({ ...acc, [item.denom.replace("ibc/", "")]: item }),
      {}
    ),
    cw20: cw20.list.reduce<AddedCW20>(
      (acc, item) => ({ ...acc, [item.token]: item }),
      {}
    ),
    native: native.list.reduce<AddedNative>(
      (acc, item) => ({ ...acc, [item.token]: item }),
      {}
    ),
  }

  const merged = {
    ...whitelist.native,
    ...added.native,
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
    list: [...ibc.list, ...cw20.list, ...native.list],
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
  const { data: cw20, ...cw20WhitelistState } = useCW20Whitelist()
  const { whitelist } = useWhitelist()
  const networkName = useNetworkName()

  const render = () => {
    if (!cw20) return null

    const cw20Whitelist: CW20Whitelist = {}
    const nativeWhitelist: NativeWhitelist = {}
    Object.entries(whitelist[networkName]).forEach(([denom, asset]) => {
      if (AccAddress.validate(denom)) {
        cw20Whitelist[denom] = asset
      } else {
        nativeWhitelist[denom] = asset
      }
    })

    return (
      <WithSearchInput>
        {(input) => (
          <Component
            whitelist={{
              cw20: {
                ...cw20,
                ...cw20Whitelist,
              },
              native: nativeWhitelist,
            }}
            keyword={input}
          />
        )}
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
