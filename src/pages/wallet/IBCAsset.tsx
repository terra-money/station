import { ReactNode } from "react"
import { getAmount } from "utils/coin"
import { useBankBalance } from "data/queries/bank"
import { WithTokenItem } from "data/token"
import { Props as AssetProps } from "./Asset"

interface Props {
  denom: IBCDenom
  children: (item: AssetProps) => ReactNode
}

const IBCAsset = ({ denom, children: render }: Props) => {
  const bankBalance = useBankBalance()
  const balance = getAmount(bankBalance, denom)

  return (
    <WithTokenItem token={denom} key={denom}>
      {(item) => render({ ...item, balance })}
    </WithTokenItem>
  )
}

export default IBCAsset
