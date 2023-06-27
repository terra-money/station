import { AccAddress } from "@terra-money/feather.js"
import { useCustomTokensNative } from "data/settings/CustomTokens"
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

const isCW20 = ({ token }: CustomTokenCW20 | NativeTokenItem) =>
  AccAddress.validate(token)

const Component = ({ whitelist, keyword }: Props) => {
  const cw20 = useCustomTokensCW20()
  const native = useCustomTokensNative()

  type AddedCW20 = Record<TerraAddress, CustomTokenCW20>
  type AddedNative = Record<CoinDenom, NativeTokenItem>

  const added = {
    cw20: cw20.list.reduce<AddedCW20>(
      (acc, item) => ({ ...acc, [item.token]: item }),
      {}
    ),
    native: native.list.reduce<AddedNative>((acc, item) => {
      const token = whitelist.native[item.denom]
      if (token) {
        acc[item.denom] = whitelist.native[item.denom]
      }

      return acc
    }, {}),
  }

  const merged = {
    ...whitelist.native,
    ...whitelist.cw20,
    ...added.native,
    ...added.cw20,
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
    : Object.values(merged ?? {}).filter((item) => {
        const { symbol, name } = item
        return [symbol, name].some((word) =>
          word?.toLowerCase().includes(keyword.toLowerCase())
        )
      })

  const manage = {
    list: [...cw20.list, ...native.list],
    getIsAdded: (item: CustomTokenCW20 | NativeTokenItem) => {
      if (isCW20(item)) return cw20.getIsAdded(item)
      const nativeItem = item as NativeTokenItem
      return native.getIsAdded({
        id: [nativeItem.chains[0], nativeItem.token].join(":"),
        denom: nativeItem.token,
      })
    },
    add: (item: CustomTokenCW20 | NativeTokenItem) => {
      if (isCW20(item)) return cw20.add(item)
      const nativeItem = item as NativeTokenItem
      return native.add({
        id: [nativeItem.chains[0], nativeItem.token].join(":"),
        denom: nativeItem.token,
      })
    },
    remove: (item: CustomTokenCW20 | NativeTokenItem) => {
      if (isCW20(item)) return cw20.remove(item)
      const nativeItem = item as NativeTokenItem
      return native.remove({
        id: [nativeItem.chains[0], nativeItem.token].join(":"),
        denom: nativeItem.token,
      })
    },
  }

  const renderTokenItem = (item: CustomTokenCW20 | NativeTokenItem) => {
    // TODO: distinguish native and cw20
    const { token, symbol, ...rest } = item
    return { ...rest, token, title: symbol, contract: token, key: token }
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
    Object.entries(whitelist[networkName] ?? {}).forEach(([id, asset]) => {
      if (AccAddress.validate(asset.token)) {
        cw20Whitelist[asset.token] = asset
      } else {
        nativeWhitelist[id] = asset
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
