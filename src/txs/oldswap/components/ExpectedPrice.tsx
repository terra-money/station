import { useTranslation } from "react-i18next"
import { toPrice } from "utils/num"
import { Read } from "components/token"
import { PayloadOnchain, PayloadTerraswap } from "../useSwapUtils"
import { PayloadRouteswap } from "../useSwapUtils"
import { SwapMode } from "../useSwapUtils"
import { SlippageParams, SwapSpread, useSingleSwap } from "../SingleSwapContext"
import Price from "./Price"

interface Props extends SlippageParams, SwapSpread {
  mode: SwapMode
  isLoading: boolean
  rate?: Price
  payload?: PayloadOnchain | PayloadTerraswap | PayloadRouteswap
}

const ExpectedPrice = ({ mode, input, ...props }: Props) => {
  const { offerAsset, askAsset } = props
  const { price, rate, minimum_receive, payload, isLoading } = props
  const { t } = useTranslation()

  /* decimals */
  const { findDecimals } = useSingleSwap()
  const offerDecimals = findDecimals(offerAsset)
  const askDecimals = findDecimals(askAsset)

  /* render: expected price */
  const renderPrice = (price?: Price) => <Price {...props} price={price} />

  const renderExpectedPrice = () => {
    return (
      <>
        <dt>{t("Expected price")}</dt>
        <dd>{!isLoading && renderPrice(price)}</dd>
      </>
    )
  }

  /* render: by mode */
  const renderTerraswap = () => {
    const fee = payload as PayloadTerraswap

    const decimals = askDecimals - offerDecimals
    const price = toPrice(Number(rate) * Math.pow(10, decimals))

    return (
      <>
        {!!price && (
          <>
            <dt>{t("Pair price")}</dt>
            <dd>{renderPrice(price)}</dd>
          </>
        )}

        {renderExpectedPrice()}

        <dt>{t("Trading fee")}</dt>
        <dd>
          {!isLoading && (
            <Read amount={fee} denom={askAsset} decimals={askDecimals} />
          )}
        </dd>
      </>
    )
  }

  const renderRouteswap = () => {
    return <>{renderExpectedPrice()}</>
  }

  const renderByMode = (mode: SwapMode) =>
    ({
      [SwapMode.TERRASWAP]: renderTerraswap,
      [SwapMode.ASTROPORT]: renderTerraswap,
      [SwapMode.ROUTESWAP]: renderRouteswap,
    }[mode]())

  /* render: minimum received */
  const renderMinimumReceived = () => {
    return (
      <>
        <dt>{t("Minimum received")}</dt>
        <dd>
          {!isLoading && (
            <Read
              amount={minimum_receive}
              token={askAsset}
              decimals={findDecimals(askAsset)}
            />
          )}
        </dd>
      </>
    )
  }

  if (!Number.isFinite(price)) return null

  return (
    <dl>
      {mode && renderByMode(mode)}
      {renderMinimumReceived()}
    </dl>
  )
}

export default ExpectedPrice
