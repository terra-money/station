import { useBankBalance } from "data/queries/bank"
import { WithTokenItem } from "data/token"
import { getAmount } from "utils/coin"
import Asset from "./Asset"

const IBCAsset = ({ denom }: { denom: IBCDenom }) => {
  const bankBalance = useBankBalance()
  const balance = getAmount(bankBalance, denom)

  return (
    <WithTokenItem token={denom} key={denom}>
      {(item) => <Asset {...item} balance={balance} />}
    </WithTokenItem>
  )
}

export default IBCAsset
