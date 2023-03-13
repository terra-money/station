import { useTranslation } from "react-i18next"
import { Read, ReadPercent } from "components/token"
import { SwapAssets } from "./useSwapUtils"
import { SwapSpread } from "./SingleSwapContext"
import { useTFMSwap } from "./TFMSwapContext"
import Price from "./components/Price"

interface Props extends SwapAssets, Partial<SwapSpread> {
  price_impact: number
}

const TFMExpectedPrice = (props: Props) => {
  const { askAsset, price, minimum_receive, price_impact } = props
  const { t } = useTranslation()
  const { findDecimals } = useTFMSwap()

  if (!Number.isFinite(price)) return null

  return (
    <dl>
      <dt>{t("Expected price")}</dt>
      <dd>
        <Price {...props} price={price} />
      </dd>
      <dt>{t("Minimum received")}</dt>
      <dd>
        <Read
          amount={minimum_receive}
          token={askAsset}
          decimals={findDecimals(askAsset)}
        />
      </dd>
      <dt>{t("Price impact")}</dt>
      <dd>
        <ReadPercent>{price_impact}</ReadPercent>
      </dd>
    </dl>
  )
}

export default TFMExpectedPrice
