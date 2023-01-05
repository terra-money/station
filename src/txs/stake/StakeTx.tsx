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

const StakeTx = () => {
  const { t } = useTranslation()
  const { address: destination } = useParams() // destination validator
  const networks = useNetwork()
  const network = useMemo(() => {
    if (!destination || !ValAddress.validate(destination)) return null
    return Object.values(networks).find(
      ({ prefix }) => prefix === ValAddress.getPrefix(destination)
    )
  }, [networks, destination])

  if (!destination) throw new Error("Validator is not defined")
  if (!network) throw new Error("Validator not found or invalid")

  const location = useLocation()
  const initialTab = location.state as string

  const { data: balances, ...balancesState } = useBalances()
  const { data: validators, ...validatorsState } = useValidators(
    network.chainID
  )
  const { data: delegations, ...delegationsState } = useDelegations(
    network.chainID
  )
  const state = combineState(balancesState, validatorsState, delegationsState)

  const getDisabled = (tab: StakeAction) => {
    if (!delegations) return true
    const availableActions = getAvailableStakeActions(destination, delegations)
    return !availableActions[tab]
  }

  const renderTab = (tab: StakeAction) => {
    if (!(balances && validators && delegations)) return null
    const props = {
      tab,
      destination,
      balances,
      validators,
      delegations,
      chainID: network.chainID,
    }
    return <StakeForm {...props} />
  }

  return (
    <Page {...state} title={t("Delegate")}>
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
          <ValidatorCompact vertical />,
        ]}
      />
    </Page>
  )
}

export default StakeTx
