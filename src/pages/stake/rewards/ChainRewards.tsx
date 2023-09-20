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

  // If the data is not available do not
  // compute anything nor render the KPI
  if (!chainRewards || !allianceHubRewards || !exchangeRates) {
    return null
  }

  // If the selected network is phoenix-1, pisco-1 or all
  // account the rewards from alliance hub as well
  let totalChainRewardsList =
    chain === "phoenix-1" || chain === "pisco-1" || chain === "all"
      ? chainRewards.total.add(getCoinsFromRewards(allianceHubRewards))
      : chainRewards.total

  // The delegation rewards are returned using sdk.DecCoins type which means that
  // after the comma there is a fraction of unit of a token available follow:
  // ref.
  //  - https://github.com/terra-money/cosmos-sdk/blob/upgrade/v0.46.x-terra/x/distribution/keeper/grpc_query.go#L166 .
  //  - https://github.com/terra-money/cosmos-sdk/blob/upgrade/v0.46.x-terra/x/staking/types/staking.pb.go#L592-L599
  //
  // Since the user cannnot claim a 1 utoken we filter out these values
  // e.g. 0.000000065984338625uluna < 1uluna
  totalChainRewardsList = totalChainRewardsList.filter((rew) =>
    rew.amount.gte(1)
  )

  // Find the current chain denom
  const selectedChainDenom = networks[chain]?.baseAsset

  // Values to be displayed in the KPI
  let tokensPrice = 0
  let tokensAmount = 0

  // Compute the value of the rewards in the selected currency
  for (const { amount, denom } of totalChainRewardsList.toArray()) {
    const { token, decimals } = readNativeDenom(denom)
    const tokenPrice = exchangeRates[token]?.price ?? 0
    const tokensValue =
      (amount.toNumber() * tokenPrice) / Math.pow(10, decimals)

    tokensPrice += tokensValue
    if (denom === selectedChainDenom) {
      tokensAmount += amount.toNumber() / Math.pow(10, decimals)
    }
  }

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
              {tokensPrice !== 0 && (
                <span className={styles.view_more}>View More</span>
              )}
            </div>
          }
          value={tokensPrice?.toString()}
          amount={tokensAmount.toString()}
          denom={selectedChainDenom}
          onClick={open}
          cardName="rewards"
        ></StakedCard>
      )}
    >
      <TokenCardGrid maxHeight>
        {totalChainRewardsList.map(({ amount, denom }) => (
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
