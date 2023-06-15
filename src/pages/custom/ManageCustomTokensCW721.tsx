import { AccAddress } from "@terra-money/feather.js"
import { useCustomTokensCW721 } from "data/settings/CustomTokens"
import { useCW721Whitelist } from "data/Terra/TerraAssets"
import { useInitMsg } from "data/queries/wasm"
import { Fetching } from "components/feedback"
import WithSearchInput from "./WithSearchInput"
import TokenList from "./TokenList"

interface Props {
  whitelist: CW721Whitelist
  keyword: string
}

const Component = ({ whitelist, keyword }: Props) => {
  const manage = useCustomTokensCW721()

  type Added = Record<TerraAddress, CustomTokenCW721>
  const added = manage.list.reduce<Added>(
    (acc, item) => ({ ...acc, [item.contract]: item }),
    {}
  )

  const merged = { ...added, ...whitelist }

  // if listed
  const listedItem = merged[keyword]

  // if not listed
  const { data: initMsg, ...state } = useInitMsg<CW721ContractInfoResponse>(
    !listedItem ? keyword : ""
  )

  const responseItem = initMsg ? { contract: keyword, ...initMsg } : undefined

  // conclusion
  const result = listedItem ?? responseItem

  // list
  const results = AccAddress.validate(keyword)
    ? result
      ? [result]
      : []
    : Object.values(merged ?? {}).filter(({ name, symbol }) =>
        [symbol, name].some((word) =>
          word?.toLowerCase().includes(keyword.toLowerCase())
        )
      )

  return (
    <TokenList
      {...state}
      {...manage}
      results={results}
      renderTokenItem={({ contract, name, ...rest }) => {
        return {
          ...rest,
          token: contract,
          title: name,
          contract,
          key: contract,
        }
      }}
    />
  )
}

const ManageCustomTokensCW721 = () => {
  const { data: whitelist, ...state } = useCW721Whitelist()

  return (
    <Fetching {...state} height={2}>
      {whitelist && (
        <WithSearchInput>
          {(input) => <Component whitelist={whitelist} keyword={input} />}
        </WithSearchInput>
      )}
    </Fetching>
  )
}

export default ManageCustomTokensCW721
