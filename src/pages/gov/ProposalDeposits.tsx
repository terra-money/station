import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import { readPercent } from "@terra-money/terra-utils"
import { getAmount } from "utils/coin"
import { combineState } from "data/query"
import { useProposal } from "data/queries/gov"
import { useDeposits, useDepositParams } from "data/queries/gov"
import { Card } from "components/layout"
import { Read } from "components/token"
import { DateTimeRenderer } from "components/display"
import Orb from "./components/Orb"
import styles from "./ProposalDeposits.module.scss"
import { useNetwork } from "data/wallet"

interface Props {
  id: string
  chain: string
  card?: boolean
}

const ProposalDeposits = ({ id, chain, card }: Props) => {
  const { t } = useTranslation()
  const networks = useNetwork()
  const { data: proposal, ...proposalState } = useProposal(id, chain)
  const { data: deposits, ...depositsState } = useDeposits(id, chain)
  const { data: depositParams, ...depositParamsState } = useDepositParams(chain)
  const state = combineState(proposalState, depositsState, depositParamsState)

  const render = () => {
    if (!(proposal && deposits && depositParams)) return null

    const getProposalDeposited = () => {
      const deposited = deposits.reduce(
        (acc, { amount }) =>
          new BigNumber(acc)
            .plus(getAmount(amount, networks[chain].baseAsset))
            .toString(),
        "0"
      )
      const minimum = getAmount(
        depositParams.min_deposit,
        networks[chain].baseAsset
      )
      const ratio = Number(deposited) / Number(minimum)
      return { deposited, ratio }
    }

    const { deposited, ratio } = getProposalDeposited()
    const { deposit_end_time } = proposal

    const contents = [
      {
        title: t("Deposited"),
        content: <Read amount={deposited} denom={networks[chain].baseAsset} />,
      },
      {
        title: t("Deposit end time"),
        content: (
          <DateTimeRenderer format={"localestring"}>
            {deposit_end_time}
          </DateTimeRenderer>
        ),
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
    <Card
      {...state}
      title={t("Deposit")}
      mainClassName={styles.main}
      bordered
      twoTone
    >
      {render()}
    </Card>
  ) : (
    render()
  )
}

export default ProposalDeposits
