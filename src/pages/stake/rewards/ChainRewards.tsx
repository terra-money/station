import { useTranslation } from "react-i18next"
import { useExchangeRates } from "data/queries/coingecko"
import { useCurrency } from "data/settings/Currency"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { useNativeDenoms, WithTokenItem } from "data/token"
import { useNetworkWithFeature } from "data/wallet"
import { combineState } from "data/query"
import {
  useRewards,
  calcRewardsValuesForChain,
} from "data/queries/distribution"
import { ModalButton } from "components/feedback"
import { TooltipIcon } from "components/display"
import StakedCard from "../components/StakedCard"
import { TokenCard, TokenCardGrid } from "components/token"
import RewardsTooltip from "../RewardsTooltip"
import styles from "../CardModal.module.scss"
import { ChainFeature } from "types/chains"

const ChainRewards = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue()
  const readNativeDenom = useNativeDenoms()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)

  const { data: exchangeRates, ...exchangeRatesState } = useExchangeRates()
  const { data: chainRewards, ...chainRewardsState } = useRewards(chain)

  const state = combineState(exchangeRatesState, chainRewardsState)

  /* render */
  const title = t("Staking rewards")
  const render = () => {
    if (!chainRewards || !exchangeRates) return null

    let sameDenom = true
    const chainTotalPriceAndAmount: any = chainRewards?.total.toData().reduce(
      ({ amountTotal, priceTotal }, { amount, denom }, index) => {
        const { token, decimals } = readNativeDenom(denom)
        if (denom !== chainRewards?.total.toData()[0].denom) {
          sameDenom = false
        }

        let newPriceHolder = priceTotal
        let newAmountHolder = amountTotal
        if (index === 0) {
          newPriceHolder = 0
          newAmountHolder = 0
        }

        return {
          amountTotal: newAmountHolder + parseInt(amount) / 10 ** decimals,
          priceTotal:
            newPriceHolder +
            (parseInt(amount) * (exchangeRates?.[token]?.price || 0)) /
              10 ** decimals,
        }
      },
      { amountTotal: -1, priceTotal: -1 }
    )

    const totalToDisplay = chainTotalPriceAndAmount?.priceTotal
    const amountToDisplay = chainTotalPriceAndAmount?.amountTotal

    const totalChainRewards = calcRewardsValuesForChain(
      chainRewards,
      currency.id
    )
    if (!sameDenom) {
      totalChainRewards.reduce((acc: any, item, index) => {
        if (acc && index === totalChainRewards.length - 1) {
          sameDenom = true
          return true
        }

        if (item.denom === totalChainRewards[0].denom) {
          return true
        } else {
          return false
        }
      }, true)
    }

    const showTokens = totalToDisplay === -1 || sameDenom

    const list = totalChainRewards

    return (
      <ModalButton
        title={title}
        renderButton={(open) => (
          <StakedCard
            {...state}
            title={
              <div className={styles.header_wrapper}>
                <TooltipIcon content={<RewardsTooltip />} placement="bottom">
                  {title}
                </TooltipIcon>
                {totalToDisplay !== -1 && sameDenom && (
                  <span className={styles.view_more}>View More</span>
                )}
              </div>
            }
            value={totalToDisplay?.toString() || "-1"}
            amount={amountToDisplay.toString()}
            denom={networks[chain]?.baseAsset || ""}
            showTokens={showTokens}
            onClick={open}
            cardName="rewards"
          ></StakedCard>
        )}
      >
        <TokenCardGrid maxHeight>
          {list?.map(({ amount, denom }) => (
            <WithTokenItem token={denom} key={denom}>
              {(item) => (
                <TokenCard
                  {...item}
                  amount={amount}
                  value={calcValue({ amount, denom })}
                />
              )}
            </WithTokenItem>
          ))}
        </TokenCardGrid>
      </ModalButton>
    )
  }

  return render()
}

export default ChainRewards
