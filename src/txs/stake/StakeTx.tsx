import { useTranslation } from "react-i18next"
import { useLocation, useParams } from "react-router-dom"
import { getAvailableStakeActions } from "data/queries/staking"
import { useDelegations, useValidators } from "data/queries/staking"
import { combineState } from "data/query"
import { Auto, Page, Tabs, Card } from "components/layout"
import ValidatorCompact from "pages/stake/ValidatorCompact"
import TxContext from "../TxContext"
import StakeForm, { StakeAction } from "./StakeForm"

const StakeTx = () => {
  const { t } = useTranslation()
  const { address: destination } = useParams() // destination validator

  if (!destination) throw new Error("Validator is not defined")

  const location = useLocation()
  const initialTab = location.state as string

  const { data: validators, ...validatorsState } = useValidators()
  const { data: delegations, ...delegationsState } = useDelegations()
  const state = combineState(validatorsState, delegationsState)

  const getDisabled = (tab: StakeAction) => {
    if (!delegations) return true

    const availableActions = getAvailableStakeActions(destination, delegations)

    return !availableActions[tab]
  }

  const renderTab = (tab: StakeAction) => {
    if (!(validators && delegations)) return null
    const props = { tab, destination, validators, delegations }
    return <StakeForm {...props} />
  }

  return (
    <Page {...state} title={t("Delegate")}>
      <Tabs
        tabs={Object.values(StakeAction).map((tab) => {
          return {
            key: tab,
            tab: t(tab),
            children: (
              <Auto
                columns={[
                  <Card>
                    <TxContext>{renderTab(tab)}</TxContext>
                  </Card>,
                  <ValidatorCompact vertical />,
                ]}
              />
            ),
            disabled: getDisabled(tab),
          }
        })}
        defaultActiveKey={initialTab}
        type="card"
      />
    </Page>
  )
}

export default StakeTx
