import { useTranslation } from "react-i18next"
import { combineState } from "data/query"
import { useInterchainDelegations } from "data/queries/staking"
import { Page, ChainFilter } from "components/layout"
import DelegationsPromote from "app/containers/DelegationsPromote"
import WithdrawRewardsTx from "./WithdrawRewardsTx"
import { useAllianceHub } from "data/queries/alliance-protocol"
import { parseResToDelegation } from "data/parsers/alliance-protocol"

const WithdrawRewards = () => {
  const { t } = useTranslation()
  const interchainDelegations = useInterchainDelegations()
  const allianceHub = useAllianceHub()

  const alliancesHubDelegations = allianceHub.useDelegations()
  const delegations = interchainDelegations.reduce(
    (acc, { data }) => (data ? [...acc, ...data.delegation] : acc),
    parseResToDelegation(alliancesHubDelegations?.data)
  )

  const state = combineState(...interchainDelegations, alliancesHubDelegations)
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
