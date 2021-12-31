import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { getAvailableAnchorEarnActions } from "data/external/anchor"
import { useAnchorExchangeRate } from "data/external/anchor"
import { useAnchorTotalDeposit } from "data/external/anchor"
import { Auto, Page, Tabs, Card } from "components/layout"
import AnchorEarnPromote from "app/containers/AnchorEarnPromote"
import TxContext from "../TxContext"
import AnchorEarnForm, { AnchorEarnAction } from "./AnchorEarnForm"

const AnchorEarnTx = () => {
  const { t } = useTranslation()

  const bankBalance = useBankBalance()
  const { data: deposit, ...totalDepositState } = useAnchorTotalDeposit()
  const { data: rate, ...exchangeRateState } = useAnchorExchangeRate()
  const state = combineState(totalDepositState, exchangeRateState)

  const getDisabled = (tab: AnchorEarnAction) => {
    if (!deposit) return true
    const availableActions = getAvailableAnchorEarnActions(deposit, bankBalance)
    return !availableActions[tab]
  }

  const renderTab = (tab: AnchorEarnAction) => {
    if (!(deposit && rate)) return null
    return <AnchorEarnForm tab={tab} deposit={deposit} rate={rate} />
  }

  return (
    <Page {...state} title={t("Earn")}>
      <Tabs
        tabs={Object.values(AnchorEarnAction).map((tab) => ({
          key: tab,
          tab,
          children: (
            <Auto
              columns={[
                <Card>
                  <TxContext>{renderTab(tab)}</TxContext>
                </Card>,
                <AnchorEarnPromote />,
              ]}
            />
          ),
          disabled: getDisabled(tab),
        }))}
        type="card"
      />
    </Page>
  )
}

export default AnchorEarnTx
