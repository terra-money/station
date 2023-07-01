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
import { ValAddress } from "@terra-money/feather.js"
import { useMemo } from "react"
import styles from "./StakeTx.module.scss"
import {
  getAvailableAllianceStakeActions,
  useAllianceDelegations,
} from "data/queries/alliance"
import StakingDetailsCompact from "pages/stake/StakingDetailsCompact"

const StakeTx = () => {
  const { t } = useTranslation()
  const { address: destination, denom: paramDenom } = useParams() // destination validator
  const networks = useNetwork()
  const network = useMemo(() => {
    if (!destination || !ValAddress.validate(destination)) return null
    return Object.values(networks ?? {}).find(
      ({ prefix }) => prefix === ValAddress.getPrefix(destination)
    )
  }, [networks, destination])

  if (!destination) throw new Error("Validator is not defined")
  if (!network) throw new Error("Validator not found or invalid")

  const denom = paramDenom?.replaceAll("=", "/") || network.baseAsset
  const isAlliance = denom !== network.baseAsset

  const location = useLocation()
  const initialTab = location.state as string

  const { data: balances, ...balancesState } = useBalances()
  const { data: validators, ...validatorsState } = useValidators(
    network?.chainID
  )
  const { data: delegations, ...delegationsState } = useDelegations(
    network?.chainID,
    isAlliance
  )
  const { data: allianceDelegations, ...allianceDelegationsState } =
    useAllianceDelegations(network?.chainID, !isAlliance)

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
    if (!(balances && validators)) return null
    if (isAlliance) {
      if (!allianceDelegations) return null
      const props = {
        tab,
        destination,
        balances,
        validators,
        chainID: network?.chainID,
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
        chainID: network?.chainID,
        denom,
        details: {
          isAlliance,
          delegations: delegations,
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
            tabs={Object.values(StakeAction ?? {}).map((tab) => {
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
            <StakingDetailsCompact denom={denom} chainID={network?.chainID} />
          </div>,
        ]}
      />
    </Page>
  )
}

export default StakeTx
