import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { useInterchainDelegations } from "data/queries/staking"
import { Page, ChainFilter } from "components/layout"
import { Delegation } from "@terra-money/feather.js"
import DelegationsPromote from "app/containers/DelegationsPromote"
import WithdrawRewardsTx from "./WithdrawRewardsTx"

const WithdrawRewards = () => {
  const { t } = useTranslation()
  const interchainDelegations = useInterchainDelegations()

  const delegations = interchainDelegations.reduce(
    (acc, { data }) => (data ? [...acc, ...data.delegation] : acc),
    [] as Delegation[]
  )

  const state = combineState(...interchainDelegations)

  const render = () => {
    if (!delegations) return null

    const hasDelegations = !!delegations.length

    if (!hasDelegations) return <DelegationsPromote />

    return (
      <ChainFilter>
        {(chain) => <WithdrawRewardsTx chain={chain ?? ""} />}
      </ChainFilter>
    )
  }

  return (
    <Page
      {...state}
      backButtonPath="/stake"
      title={t("Withdraw rewards")}
      small
    >
      {render()}
    </Page>
  )
}

export default WithdrawRewards
