import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { isVestingAccount, useAccount } from "data/queries/vesting"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { Page, Card } from "components/layout"
import { Wrong } from "components/feedback"
import DonateAllVestingTokensForm from "./DonateAllVestingTokensForm"
import { useChainID } from "data/wallet"

const DonateAllVestingTokensTx = () => {
  const { t } = useTranslation()
  const chainID = useChainID()
  const { data: account, ...accountState } = useAccount()
  const { data: delegations, ...delegationsState } = useDelegations(chainID)
  const { data: unbondings, ...unbondingsState } = useUnbondings(chainID)

  const state = combineState(accountState, delegationsState, unbondingsState)

  const render = () => {
    if (!(account && delegations && unbondings)) return null

    if (!isVestingAccount(account))
      return <Wrong>{t("Vesting does not exist")}</Wrong>

    if (delegations.length || unbondings.length)
      return <Wrong>{t("All Luna must be undelegated")}</Wrong>

    return <DonateAllVestingTokensForm account={account} />
  }

  return (
    <Page title={t("Donate all vesting tokens")} small>
      <Card {...state}>{render()}</Card>
    </Page>
  )
}

export default DonateAllVestingTokensTx
