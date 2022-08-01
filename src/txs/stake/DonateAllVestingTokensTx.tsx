import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { isVestingAccount, useAccount } from "data/queries/vesting"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"
import TxContext from "../TxContext"
import DonateAllVestingTokensForm from "./DonateAllVestingTokensForm"

const DonateAllVestingTokensTx = () => {
  const { t } = useTranslation()

  const { data: account, ...accountState } = useAccount()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: unbondings, ...unbondingsState } = useUnbondings()

  const state = combineState(accountState, delegationsState, unbondingsState)

  const render = () => {
    if (!(account && delegations && unbondings)) return null

    if (!isVestingAccount(account))
      return <Wrong>{t("Vesting does not exist")}</Wrong>

    if (delegations.length || unbondings.length)
      return <Wrong>{t("All Luna must be undelegated")}</Wrong>

    return (
      <TxContext>
        <DonateAllVestingTokensForm account={account} />
      </TxContext>
    )
  }

  return (
    <Page title={t("Donate all vesting tokens")} small>
      <Card {...state}>{render()}</Card>
    </Page>
  )
}

export default DonateAllVestingTokensTx
