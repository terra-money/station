import { ButtonFilter, Card, Page } from "components/layout"
import ChainFilter from "components/layout/ChainFilter"
import { useBalances } from "data/queries/bank"
import { useTranslation } from "react-i18next"
import QuickStakeForm from "txs/stake/QuickStakeForm"
import styles from "./QuickStake.module.scss"

export enum QuickStakeAction {
  DELEGATE = "Delegate",
  UNBOND = "Undelegate",
}

const QuickStake = () => {
  const { t } = useTranslation()

  const renderQuickStakeForm = (
    chainID: string | undefined,
    action: string | undefined
  ) => {
    if (!(balances && chainID && action)) return null
    const props = {
      action,
      balances,
      chainID,
    }
    return <QuickStakeForm {...props} />
  }

  const { data: balances } = useBalances()

  return (
    <Page>
      <ButtonFilter
        title={t("Select action")}
        actions={[QuickStakeAction.DELEGATE, QuickStakeAction.UNBOND]}
      >
        {(action) => (
          <Card muted>
            <Page small invisible>
              <ChainFilter outside className={styles.filter}>
                {(chainID) => renderQuickStakeForm(chainID, action)}
              </ChainFilter>
            </Page>
          </Card>
        )}
      </ButtonFilter>
    </Page>
  )
}

export default QuickStake
