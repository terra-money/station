import classNames from "classnames/bind"
import { Card, Flex, Grid } from "components/layout"
import styles from "./StakingDetailsCompact.module.scss"
import { useNativeDenoms } from "data/token"
import { useNetworkWithFeature } from "data/wallet"
import { useTranslation } from "react-i18next"
import { readPercent } from "@terra-money/terra-utils"
import { useDelegations, useStakingParams } from "data/queries/staking"
import { useAlliance, useAllianceDelegations } from "data/queries/alliance"
import { combineState } from "data/query"
import { Read } from "components/token"
import { ChainFeature } from "types/chains"

const cx = classNames.bind(styles)

const StakingDetailsCompact = ({
  denom,
  chainID,
}: {
  denom: string
  chainID: string
}) => {
  const network = useNetworkWithFeature(ChainFeature.STAKING)
  const { t } = useTranslation()
  const readNativeDenom = useNativeDenoms()
  const token = readNativeDenom(denom)
  const { data: stakeParams, ...stakeState } = useStakingParams(chainID)
  const daysToUnbond = (stakeParams?.unbonding_time ?? 0) / 60 / 60 / 24

  const isAlliance = network[chainID].baseAsset !== denom
  const { data: alliance, ...allianceState } = useAlliance(
    chainID,
    denom,
    !isAlliance
  )

  const { data: delegations, ...delegationsState } = useDelegations(
    chainID,
    isAlliance
  )
  const { data: allianceDelegations, ...allianceDelegationsState } =
    useAllianceDelegations(chainID, !isAlliance)

  const delegated = isAlliance
    ? allianceDelegations?.reduce(
        (acc, { balance: amount }) => acc + Number(amount),
        0
      )
    : delegations?.reduce(
        (acc, { balance }) => acc + balance.amount.toNumber(),
        0
      )

  const state = combineState(
    stakeState,
    allianceState,
    delegationsState,
    allianceDelegationsState
  )

  return (
    <Card {...state}>
      <Grid gap={16}>
        <header className={cx(styles.header)}>
          <Flex gap={4} start>
            <div className={styles.token__icon__container}>
              {token && (
                <img
                  src={token.icon}
                  alt={token.symbol}
                  className={styles.token__icon}
                />
              )}
              {network && (
                <img
                  src={network[chainID].icon}
                  alt={network[chainID].name}
                  className={styles.chain__icon}
                />
              )}
            </div>
            {token.name}

            <span className={styles.alliance__logo}>
              {network[chainID].name}
            </span>

            {isAlliance && <span className={styles.alliance__logo}>🤝</span>}
          </Flex>
          <div className={styles.staking__details__container}>
            <dl>
              <dt>{t("Unbonding period")}:</dt>
              <dd>{t("{{value}} days", { value: daysToUnbond })}</dd>
            </dl>
            <dl>
              <dt>{t("Rewards rate")}:</dt>
              <dd>
                {readPercent(isAlliance ? alliance?.reward_weight ?? 0 : 1)}
              </dd>
            </dl>
          </div>
          {!!delegated && (
            <div className={styles.staking__details__container}>
              <h4>{t("My Staked Position")}</h4>
              <p className={styles.delegated__amount}>
                <img src={token.icon} alt={token.name} />
                <p>
                  <Read
                    amount={delegated}
                    decimals={token.decimals}
                    fixed={2}
                  />{" "}
                  {token.symbol}
                </p>
              </p>
            </div>
          )}
        </header>
      </Grid>
    </Card>
  )
}

export default StakingDetailsCompact
