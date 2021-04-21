import { Read } from "components/token"
import { SwapAssets } from "../useSwapUtils"

interface Props extends SwapAssets {
  price?: Price
  className?: string
}

const Price = ({ price, offerAsset, askAsset, className }: Props) => {
  if (!price) return null

  return price > 1 ? (
    <span className={className}>
      <Read amount={String(1)} token={askAsset} decimals={0} /> ={" "}
      <Read amount={String(price)} token={offerAsset} decimals={0} auto />
    </span>
  ) : (
    <span className={className}>
      <Read amount={String(1)} token={offerAsset} decimals={0} /> ={" "}
      <Read amount={String(1 / price)} token={askAsset} decimals={0} auto />
    </span>
  )
}

export default Price
