import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { readPercent } from "@terra.kitchen/utils"
import { getAmount } from "utils/coin"
import { combineState } from "data/query"
import { useProposal } from "data/queries/gov"
import { useDeposits, useDepositParams } from "data/queries/gov"
import { Card } from "components/layout"
import { Read } from "components/token"
import { ToNow } from "components/display"
import Orb from "./components/Orb"
import styles from "./ProposalDeposits.module.scss"

interface Props {
  id: number
  card?: boolean
}

const ProposalDeposits = ({ id, card }: Props) => {
  const { t } = useTranslation()
  const { data: proposal, ...proposalState } = useProposal(id)
  const { data: deposits, ...depositsState } = useDeposits(id)
  const { data: depositParams, ...depositParamsState } = useDepositParams()
  const state = combineState(proposalState, depositsState, depositParamsState)

  const render = () => {
    if (!(proposal && deposits && depositParams)) return null

    const getProposalDeposited = () => {
      const deposited = deposits.reduce(
        (acc, { amount }) =>
          new BigNumber(acc).plus(getAmount(amount, "uluna")).toString(),
        "0"
      )

      const minimum = getAmount(depositParams.min_deposit, "uluna")
      const ratio = Number(deposited) / Number(minimum)
      return { deposited, ratio }
    }

    const { deposited, ratio } = getProposalDeposited()
    const { deposit_end_time } = proposal

    const contents = [
      {
        title: t("Deposited"),
        content: <Read amount={deposited} denom="uluna" />,
      },
      {
        title: t("Deposit end time"),
        content: <ToNow>{deposit_end_time}</ToNow>,
      },
    ]

    return (
      <article className={card ? styles.vertical : styles.horizontal}>
        <section className={styles.orb}>
          <Orb ratio={ratio} size={card ? "large" : undefined} />
          {card && readPercent(ratio)}
        </section>

        <section className={styles.details}>
          {contents.map(({ title, content }) => (
            <article className={styles.item} key={title}>
              <h1>{title}</h1>
              <p>{content}</p>
            </article>
          ))}
        </section>
      </article>
    )
  }

  return card ? (
    <Card {...state} title={t("Deposit")} mainClassName={styles.main} bordered>
      {render()}
    </Card>
  ) : (
    render()
  )
}

export default ProposalDeposits
