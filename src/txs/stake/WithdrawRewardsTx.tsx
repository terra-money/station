import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { calcRewardsValues, useRewards } from "data/queries/distribution"
import { useDelegations, useValidators } from "data/queries/staking"
import { has } from "utils/num"
import { useCurrency } from "data/settings/Currency"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { useIBCWhitelist } from "data/Terra/TerraAssets"
import { Page, Card } from "components/layout"
import DelegationsPromote from "app/containers/DelegationsPromote"
import TxContext from "../TxContext"
import WithdrawRewardsForm from "./WithdrawRewardsForm"

const WithdrawRewardsTx = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const calcValue = useMemoizedCalcValue()

  const { data: rewards, ...rewardsState } = useRewards()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: validators, ...validatorsState } = useValidators()
  const { data: IBCWhitelist, ...IBCWhitelistState } = useIBCWhitelist()

  const state = combineState(
    rewardsState,
    delegationsState,
    validatorsState,
    IBCWhitelistState
  )

  const render = () => {
    if (!(rewards && delegations && validators && IBCWhitelist)) return null

    const { total } = calcRewardsValues(rewards, currency, calcValue)
    const hasRewards = !!has(total.sum)
    const hasDelegations = !!delegations.length

    if (!hasRewards)
      return hasDelegations ? (
        <Card>{t("No rewards yet")}</Card>
      ) : (
        <DelegationsPromote />
      )

    return (
      <Card>
        <TxContext>
          <WithdrawRewardsForm
            rewards={rewards}
            validators={validators}
            IBCWhitelist={IBCWhitelist}
          />
        </TxContext>
      </Card>
    )
  }

  return (
    <Page {...state} title={t("Withdraw rewards")} small>
      {render()}
    </Page>
  )
}

export default WithdrawRewardsTx
