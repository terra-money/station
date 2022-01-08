import { ReactNode } from "react"
import { useTokenBalance } from "data/queries/wasm"
import { Props as AssetProps } from "./Asset"

interface Props extends TokenItem {
  children: (item: AssetProps) => ReactNode
}

const CW20Asset = ({ children: render, ...item }: Props) => {
  const { token } = item
  const { data: balance, ...state } = useTokenBalance(token)
  return <>{render({ ...item, ...state, balance })}</>
}

export default CW20Asset
