import { useTranslation } from "react-i18next"
import { useCurrency } from "data/settings/Currency"
import { combineState } from "data/query"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { useExchangeRates } from "data/queries/coingecko"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { useNativeDenoms, WithTokenItem } from "data/token"
import { ModalButton } from "components/feedback"
import { TokenCard, TokenCardGrid } from "components/token"
import { TooltipIcon } from "components/display"
import StakedCard from "../components/StakedCard"
import RewardsTooltip from "../RewardsTooltip"
import styles from "../CardModal.module.scss"
import { Coin } from "@terra-money/feather.js"

const Rewards = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue()
  const readNativeDenom = useNativeDenoms()

  const { data: rewards, ...rewardsState } = useRewards()
  const { data: exchangeRates, ...exchangeRatesState } = useExchangeRates()

  const state = combineState(rewardsState, exchangeRatesState)

  /* render */
  const title = t("Staking rewards")
  const render = () => {
    let sameDenom: boolean = true
    const coinsValue =
      !rewards || !exchangeRates
        ? 0
        : rewards.total.toData()?.reduce((acc, { amount, denom }) => {
            const { token, decimals } = readNativeDenom(denom)
            if (denom !== rewards?.total.toData()[0].denom) {
              sameDenom = false
            }
            return (
              acc +
              (parseInt(amount) * (exchangeRates?.[token]?.price || 0)) /
                10 ** decimals
            )
          }, 0)

    const totalToDisplay = coinsValue

    let list: Coin.Data[] = []
    if (rewards) {
      const { total } = calcRewardsValues(rewards, currency.id, calcValue)
      list = total.list
    }

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
              {(item) =>
                item.name && (
                  <TokenCard
                    {...item}
                    amount={amount}
                    value={calcValue({ amount, denom })}
                  />
                )
              }
            </WithTokenItem>
          ))}
        </TokenCardGrid>
      </ModalButton>
    )
  }

  return render()
}

export default Rewards
