import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ValAddress } from "@terra-money/feather.js"
import { has } from "utils/num"
import { combineState } from "data/query"
import { useCurrency } from "data/settings/Currency"
import { useMemoizedCalcValue } from "data/queries/coingecko"
import { useDelegations, useDelegation } from "data/queries/staking"
import { getAvailableStakeActions } from "data/queries/staking"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { LinkButton } from "components/general"
import { Col, Card, ExtraActions, Grid } from "components/layout"
import { Read } from "components/token"
import { StakeAction } from "txs/stake/StakeForm"
import styles from "./ValidatorActions.module.scss"
import { useNetworkWithFeature } from "data/wallet"
import { ChainFeature } from "types/chains"

const ValidatorActions = ({ destination }: { destination: ValAddress }) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const networks = useNetworkWithFeature(ChainFeature.STAKING)
  const chain = useMemo(() => {
    const prefix = ValAddress.getPrefix(destination)
    return Object.values(networks ?? {}).find(({ prefix: p }) => p === prefix)
  }, [networks, destination])
  const { data: delegation, ...delegationState } = useDelegation(destination)
  const { data: delegations, ...delegationsState } = useDelegations(
    chain?.chainID ?? ""
  )
  const { data: rewards, ...rewardsState } = useRewards()
  const state = combineState(delegationState, delegationsState)
  const calcValue = useMemoizedCalcValue()

  const label = {
    [StakeAction.DELEGATE]: t("Delegate"),
    [StakeAction.REDELEGATE]: t("Redelegate"),
    [StakeAction.UNBOND]: t("Undelegate"),
  }

  const renderDelegationsValue = () => {
    const amount =
      delegationState.isSuccess && delegation
        ? delegation.balance.amount.toString()
        : "0"

    return (
      <section>
        <Read
          amount={amount}
          denom={chain?.baseAsset}
          className={styles.total}
          block
        />
      </section>
    )
  }

  const renderDelegationsActions = () => {
    if (!delegations) return

    const availableActions = getAvailableStakeActions(destination, delegations)

    return (
      <ExtraActions align="stretch">
        {Object.values(StakeAction ?? {}).map((action) => (
          <LinkButton
            to={`/stake/${destination}`}
            state={action}
            color={action === StakeAction.DELEGATE ? "primary" : "default"}
            disabled={!availableActions[action]}
            key={action}
          >
            {label[action]}
          </LinkButton>
        ))}
      </ExtraActions>
    )
  }

  const rewardsValues = useMemo(() => {
    const defaultValues = { address: destination, sum: "0", list: [] }
    if (!rewards) return defaultValues
    const { byValidator } = calcRewardsValues(rewards, currency.id, calcValue)
    const values = byValidator.find(({ address }) => address === destination)
    return values ?? defaultValues
  }, [calcValue, currency, destination, rewards])

  const renderRewardsValue = () => {
    const { list } = rewardsValues
    const amount =
      list.find(({ denom }) => denom === chain?.baseAsset)?.amount ?? "0"

    return (
      <section>
        <Read
          amount={amount}
          denom={chain?.baseAsset}
          className={styles.total}
        />{" "}
        <span className={styles.small}>
          {list.length > 1 &&
            `+${t("{{length}} coins", { length: list.length - 1 })}`}
        </span>
      </section>
    )
  }

  const renderRewardsActions = () => {
    const disabled = !has(rewardsValues.sum)

    return (
      <ExtraActions align="stretch">
        <LinkButton to="/rewards" disabled={disabled} block>
          {t("Withdraw rewards")}
        </LinkButton>
      </ExtraActions>
    )
  }

  return (
    <Col>
      <Card {...state} title={t("My delegations")} bordered twoTone>
        <Grid gap={20}>
          {renderDelegationsValue()}
          {renderDelegationsActions()}
        </Grid>
      </Card>

      <Card {...rewardsState} title={t("My rewards")} bordered twoTone>
        <Grid gap={20}>
          {renderRewardsValue()}
          {renderRewardsActions()}
        </Grid>
      </Card>
    </Col>
  )
}

export default ValidatorActions
