import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { getAvailableStakeActions } from "data/queries/staking"
import { useDelegations, useValidators } from "data/queries/staking"
import { combineState } from "data/query"
import { useBalances } from "data/queries/bank"
import { Auto, Page, Tabs, Card } from "components/layout"
import ValidatorCompact from "pages/stake/ValidatorCompact"
import StakeForm, { StakeAction } from "./StakeForm"
import { useNetwork } from "data/wallet"
import styles from "./StakeTx.module.scss"
import { LoadingCircular } from "components/feedback"
import {
  getAvailableAllianceStakeActions,
  useAllianceDelegations,
} from "data/queries/alliance"
import StakingDetailsCompact from "pages/stake/StakingDetailsCompact"
import { useNetworks } from "app/InitNetworks"

const StakeTx = () => {
  const { t } = useTranslation()
  const { address: destination, denom: paramDenom, chainID } = useParams() // destination validator
  const networks = useNetwork()
  const { networksLoading } = useNetworks()
  const location = useLocation()
  const initialTab = location.state as string

  if (!chainID) throw new Error(`Chain with ID ${chainID} not found or invalid`)

  const denom = paramDenom?.replaceAll("=", "/") || networks[chainID]?.baseAsset
  const isAlliance = denom !== networks[chainID]?.baseAsset

  const { data: balances, ...balancesState } = useBalances()
  const { data: validators, ...validatorsState } = useValidators(chainID)
  const { data: delegations, ...delegationsState } = useDelegations(
    chainID,
    isAlliance
  )
  const { data: allianceDelegations, ...allianceDelegationsState } =
    useAllianceDelegations(chainID, !isAlliance)

  if (!destination) throw new Error("Validator is not defined")

  const state = combineState(
    balancesState,
    validatorsState,
    delegationsState,
    allianceDelegationsState
  )

  const getDisabled = (tab: StakeAction) => {
    if (isAlliance) {
      if (!allianceDelegations) return true
      const availableActions = getAvailableAllianceStakeActions(
        destination,
        allianceDelegations
      )
      return !availableActions[tab]
    } else {
      if (!delegations) return true
      const availableActions = getAvailableStakeActions(
        destination,
        delegations
      )
      return !availableActions[tab]
    }
  }

  const renderTab = (tab: StakeAction) => {
    if (networksLoading || state.isLoading) return <LoadingCircular />
    if (!(balances && validators)) return null
    if (isAlliance && allianceDelegations) {
      const props = {
        tab,
        destination,
        balances,
        validators,
        chainID,
        denom,
        details: {
          isAlliance,
          delegations: allianceDelegations,
        },
      }
      return <StakeForm {...props} />
    } else {
      if (!delegations) return null
      const props = {
        tab,
        destination,
        balances,
        validators,
        chainID,
        denom,
        details: {
          isAlliance,
          delegations,
        },
      }
      return <StakeForm {...props} />
    }
  }

  return (
    <Page {...state} title={t("Delegate")} backButtonPath="/stake">
      <Auto
        columns={[
          <Tabs
            tabs={Object.values(StakeAction).map((tab) => {
              return {
                key: tab,
                tab: t(tab),
                children: (
                  <Card muted className={styles.card}>
                    {renderTab(tab)}
                  </Card>
                ),
                disabled: getDisabled(tab),
              }
            })}
            defaultActiveKey={initialTab}
            type="page"
          />,
          <div className={styles.details__container}>
            <ValidatorCompact vertical />
            <StakingDetailsCompact denom={denom} chainID={chainID} />
          </div>,
        ]}
      />
    </Page>
  )
}

export default StakeTx
