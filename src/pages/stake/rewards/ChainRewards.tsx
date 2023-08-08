import { useTranslation } from "react-i18next"
import { useExchangeRates } from "data/queries/coingecko"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { useNativeDenoms, WithTokenItem } from "data/token"
import { useNetworkWithFeature } from "data/wallet"
import { combineState } from "data/query"
import { useRewards } from "data/queries/distribution"
import { ModalButton } from "components/feedback"
import { TooltipIcon } from "components/display"
import StakedCard from "../components/StakedCard"
import { TokenCard, TokenCardGrid } from "components/token"
import RewardsTooltip from "../RewardsTooltip"
import styles from "../CardModal.module.scss"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { getCoinsFromRewards } from "data/parsers/alliance-protocol"
import { ChainFeature } from "types/chains"

const ChainRewards = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const title = t("Staking rewards")
  const calcValue = useMemoizedCalcValue()
  const readNativeDenom = useNativeDenoms()
  const allianceHub = useAllianceHub()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)

  const { data: allianceHubRewards, ...allianceHubRewardsState } =
    allianceHub.usePendingRewards()
  const { data: exchangeRates, ...exchangeRatesState } = useExchangeRates()
  const { data: chainRewards, ...chainRewardsState } = useRewards(
    chain === "all" ? undefined : chain
  )

  const state = combineState(
    exchangeRatesState,
    chainRewardsState,
    allianceHubRewardsState
  )

  if (!chainRewards || !allianceHubRewards || !exchangeRates) return null

  // If the selected network is phoenix-1, pisco-1 or all
  // account the rewards from alliance hub as well
  let totalChainRewardsList =
    chain === "phoenix-1" || chain === "pisco-1" || chain === "all"
      ? chainRewards.total.add(getCoinsFromRewards(allianceHubRewards))
      : chainRewards.total

  const { tokensPrice, tokensAmount } = totalChainRewardsList.toArray().reduce(
    (acc, { amount, denom }) => {
      const { token, decimals } = readNativeDenom(denom)
      const tokenPrice = exchangeRates[token]?.price ?? 0
      const tokensValue =
        (amount.toNumber() * tokenPrice) / Math.pow(10, decimals)

      acc.tokensPrice += tokensValue
      if (denom === networks[chain].baseAsset) {
        acc.tokensAmount += amount.toNumber() / Math.pow(10, decimals)
      }
      return acc
    },
    { tokensPrice: 0, tokensAmount: 0 }
  )
  console.log("tokensAmount", tokensAmount)
  console.log("tokensPrice", tokensPrice)

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
              {tokensPrice && (
                <span className={styles.view_more}>View More</span>
              )}
            </div>
          }
          value={tokensPrice.toString()}
          amount={tokensAmount.toString()}
          denom={networks[chain].baseAsset}
          onClick={open}
          cardName="rewards"
        ></StakedCard>
      )}
    >
      <TokenCardGrid maxHeight>
        {totalChainRewardsList?.map(({ amount, denom }) => (
          <WithTokenItem token={denom} key={denom}>
            {(item) => (
              <TokenCard
                {...item}
                amount={amount.toString()}
                value={calcValue({ amount: amount.toString(), denom })}
              />
            )}
          </WithTokenItem>
        ))}
      </TokenCardGrid>
    </ModalButton>
  )
}

export default ChainRewards
