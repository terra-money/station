import { useTranslation } from "react-i18next"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { useExchangeRates, useMemoizedPrices } from "data/queries/coingecko"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { useNativeDenoms, WithTokenItem } from "data/token"
import { ModalButton } from "components/feedback"
import { TokenCard, TokenCardGrid } from "components/token"
import { TooltipIcon } from "components/display"
import StakedCard from "../components/StakedCard"
import RewardsTooltip from "../RewardsTooltip"
import styles from "../CardModal.module.scss"

const Rewards = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue()
  const readNativeDenom = useNativeDenoms()

  const { data: prices, ...pricesState } = useMemoizedPrices()
  const { data: rewards, ...rewardsState } = useRewards()
  const { data: exchangeRates, ...exchangeRatesState } = useExchangeRates()

  const state = combineState(rewardsState, exchangeRatesState, pricesState)

  /* render */
  const title = t("Staking rewards")
  const render = () => {
    if (!rewards || !prices) return null

    let sameDenom = true
    const coinsValue = rewards.total
      .toData()
      ?.reduce((acc, { amount, denom }) => {
        const { token, decimals } = readNativeDenom(denom)
        if (denom !== rewards?.total.toData()[0].denom) {
          sameDenom = false
        }
        return (
          acc +
          (parseInt(amount) * (prices?.[token]?.price || 0)) / 10 ** decimals
        )
      }, 0)

    const totalToDisplay = coinsValue

    const { total } = calcRewardsValues(rewards, currency.id, calcValue)
    if (!sameDenom) {
      total.list.reduce((acc: any, item, index) => {
        if (acc && index === total.list.length - 1) {
          sameDenom = true
          return true
        }

        if (item.denom === total.list[0].denom) {
          return true
        } else {
          return false
        }
      }, true)
    }

    const list = total.list

    const showTokens = totalToDisplay === -1 || sameDenom

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
                {showTokens && (
                  <span className={styles.view_more}>View More</span>
                )}
              </div>
            }
            value={totalToDisplay?.toString() || "-1"}
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

export default Rewards
