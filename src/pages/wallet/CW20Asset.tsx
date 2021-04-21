import { useTokenBalance } from "data/queries/wasm"
import Asset from "./Asset"

const CW20Asset = (item: TokenItem) => {
  const { token } = item
  const { data: balance, ...state } = useTokenBalance(token)
  return <Asset {...item} {...state} balance={balance} />
}

export default CW20Asset
