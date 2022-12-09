import { useTranslation } from "react-i18next"
import { intervalToDuration } from "date-fns"
import { useDepositParams } from "data/queries/gov"
import { useVotingParams } from "data/queries/gov"
import { Card } from "components/layout"
import { Read } from "components/token"
import DataList from "./components/DataList"
import styles from "./GovernanceParams.module.scss"
import { useNetwork } from "data/wallet"

const GovernanceParams = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const network = useNetwork()

  const { data: votingParams } = useVotingParams(chain)
  const { data: depositParams } = useDepositParams(chain)

  if (!(votingParams && depositParams)) return null

  const minDeposit = depositParams.min_deposit.get(network[chain].baseAsset)

  const contents = [
    {
      title: t("Minimum deposit"),
      content: minDeposit && (
        <Read
          amount={minDeposit.amount.toString()}
          token={network[chain].baseAsset}
        />
      ),
    },
    {
      title: t("Maximum deposit period"),
      content: t(`{{d}} days`, {
        d: daysFromNanoseconds(depositParams.max_deposit_period),
      }),
    },
    {
      title: t("Voting period"),
      content: t(`{{d}} days`, {
        d: daysFromNanoseconds(votingParams.voting_period),
      }),
    },
  ]

  return (
    <Card className={styles.params}>
      <DataList list={contents} type="horizontal" />
    </Card>
  )
}

export default GovernanceParams

/* helpers */
const daysFromNanoseconds = (second: number) => {
  const end = second * 1000
  const { days } = intervalToDuration({ start: 0, end })
  return days
}
