import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import BigNumber from "bignumber.js"
import { StakingPool, Tally, TallyParams, Vote } from "@terra-money/feather.js"
import { readAmount, readPercent } from "@terra-money/terra-utils"
import { has } from "utils/num"
import { combineState } from "data/query"
import { useGetVoteOptionItem } from "data/queries/gov"
import { useProposal, useTally, useTallyParams } from "data/queries/gov"
import { useStakingPool } from "data/queries/staking"
import { Col, Row, Card, Grid } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import { Read } from "components/token"
import { DateTimeRenderer } from "components/display"
import VoteProgress from "./components/VoteProgress"
import styles from "./ProposalVotes.module.scss"

export const options = [
  Vote.Option.VOTE_OPTION_YES,
  Vote.Option.VOTE_OPTION_ABSTAIN,
  Vote.Option.VOTE_OPTION_NO,
  Vote.Option.VOTE_OPTION_NO_WITH_VETO,
]

const ProposalVotes = ({
  id,
  chain,
  card,
}: {
  id: string
  chain: string
  card?: boolean
}) => {
  const { t } = useTranslation()
  const getVoteOptionItem = useGetVoteOptionItem()

  const { data: proposal, ...proposalState } = useProposal(id, chain)
  const { data: tally, ...tallyState } = useTally(id, chain)
  const { data: tallyParams, ...tallyParamsState } = useTallyParams(chain)
  const { data: pool, ...poolState } = useStakingPool(chain)

  const state = combineState(
    proposalState,
    tallyState,
    tallyParamsState,
    poolState
  )

  const render = () => {
    if (!(proposal && tally && tallyParams && pool)) return null

    const tallies = calcTallies(tally, tallyParams, pool)
    const { total, list, flag, isPassing } = tallies
    const { voting_end_time } = proposal

    const flagLabel = { quorum: t("Quorum"), threshold: t("Pass threshold") }

    if (!has(total.voted)) return <Empty>{t("No votes yet")}</Empty>

    return (
      <Grid gap={40}>
        {card && (
          <Row>
            <Col span={1}>
              <article className={styles.total}>
                <h1 className={styles.title}>{t("Total voted")}</h1>
                <section>
                  <Read amount={total.voted} integer /> (
                  {readPercent(total.ratio)})
                  <p>
                    {isPassing ? (
                      <strong className="info">{t("Passing...")}</strong>
                    ) : (
                      <strong className="danger">{t("Not passing...")}</strong>
                    )}
                  </p>
                </section>
              </article>
            </Col>

            <Col span={4}>
              <section className={styles.list}>
                {list.map(({ option, voted, ratio }) => {
                  const { color, label } = getVoteOptionItem(option)

                  return (
                    <article
                      className={classNames(styles.item, `border-${color}`)}
                      key={option}
                    >
                      <h1 className={styles.title}>{label}</h1>
                      <p className={styles.ratio}>
                        {readPercent(ratio.byVoted)}
                      </p>
                      <Read amount={voted} integer />
                    </article>
                  )
                })}
              </section>
            </Col>
          </Row>
        )}

        <Grid gap={4} className="small">
          <VoteProgress
            flag={{ percent: readPercent(flag.x), label: flagLabel[flag.type] }}
            list={list.map(({ option, ratio }) => ({
              color: getVoteOptionItem(option).color,
              percent: readPercent(ratio.byStaked),
            }))}
          />

          {card && (
            <p>
              {t("Voted: {{n}} / {{d}}", {
                n: readAmount(total.voted, { prefix: true }),
                d: readAmount(total.staked, { prefix: true }),
              })}
            </p>
          )}

          <p className={styles.end}>
            {new Date(voting_end_time) > new Date() ? t("Ends") : t("Ended")}{" "}
            <DateTimeRenderer format={"localestring"}>
              {voting_end_time}
            </DateTimeRenderer>
          </p>
        </Grid>
      </Grid>
    )
  }

  return card ? (
    <Card {...state} title={t("Votes")} bordered twoTone>
      {render()}
    </Card>
  ) : (
    <Fetching {...state} height={2}>
      {render()}
    </Fetching>
  )
}

export default ProposalVotes

/* helpers */
const calcTallies = (
  tally: Tally,
  { quorum, threshold }: TallyParams,
  pool: StakingPool
) => {
  const getTallyItem = (option: Vote.Option) => {
    const voted =
      option === Vote.Option.UNRECOGNIZED ||
      option === Vote.Option.VOTE_OPTION_UNSPECIFIED
        ? "0"
        : tallies[option]

    const byVoted = Number(voted) / Number(total.voted)
    const byStaked = Number(byVoted) * Number(ratio)

    return { option, voted, ratio: { byVoted, byStaked } }
  }

  const tallies = {
    [Vote.Option.VOTE_OPTION_YES]: tally.yes.toString(),
    [Vote.Option.VOTE_OPTION_ABSTAIN]: tally.abstain.toString(),
    [Vote.Option.VOTE_OPTION_NO]: tally.no.toString(),
    [Vote.Option.VOTE_OPTION_NO_WITH_VETO]: tally.no_with_veto.toString(),
  }

  const total = {
    voted: BigNumber.sum(...Object.values(tallies ?? {})).toString(),
    staked: pool.bonded_tokens.amount.toString(),
  }

  const ratio = Number(total.voted) / Number(total.staked)
  const list = options.map(getTallyItem)

  /* quorum | threshold */
  const determinantThreshold = BigNumber.sum(
    ...list.slice(0, 3).map((o) => o.ratio.byVoted)
  ).toNumber()

  const thresholdX = threshold
    .times(determinantThreshold)
    .times(ratio)
    .toNumber()

  const isBelowQuorum = quorum.gt(ratio)
  const flag = isBelowQuorum
    ? { x: quorum.toNumber(), type: "quorum" as const }
    : { x: thresholdX, type: "threshold" as const }

  const yesRatio = list[0].ratio.byVoted
  const noRatio = list.slice(2, 4).map(({ ratio }) => ratio.byVoted)

  const isPassing = !isBelowQuorum && BigNumber.sum(...noRatio).lte(yesRatio)

  return { list, total: { ...total, ratio }, flag, isPassing }
}
