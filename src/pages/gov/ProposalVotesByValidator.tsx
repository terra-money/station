import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import classNames from "classnames/bind"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import { readPercent } from "@terra-money/terra-utils"
import { ValAddress, Vote } from "@terra-money/feather.js"
import { combineState } from "data/query"
import { useDelegations, useValidators } from "data/queries/staking"
import { useGetVoteOptionItem } from "data/queries/gov"
import { getCalcVotingPowerRate } from "data/Terra/TerraAPI"
import { useTerraProposal } from "data/Terra/TerraAPI"
import { ExternalLink } from "components/general"
import { Card, Grid, Table } from "components/layout"
import { Checkbox } from "components/form"
import { Empty } from "components/feedback"
import { Tooltip } from "components/display"
import { getIsUnbonded } from "../stake/Validators"
import { options } from "./ProposalVotes"
import styles from "./ProposalVotesByValidator.module.scss"
import { useChainID } from "data/wallet"

const cx = classNames.bind(styles)

const ProposalVotesByValidator = ({ id }: { id: string }) => {
  const { t } = useTranslation()
  const chainID = useChainID()

  const tooltipContents: Record<Vote.Option, string> = {
    [Vote.Option.VOTE_OPTION_YES]: t("Agree"),
    [Vote.Option.VOTE_OPTION_NO]: t("Disagree"),
    [Vote.Option.VOTE_OPTION_NO_WITH_VETO]: t(
      "Strongly disagree and should not return the deposit to the proposer"
    ),
    [Vote.Option.VOTE_OPTION_ABSTAIN]: t(
      "No decision but this vote counts toward vote quorum"
    ),
    [Vote.Option.VOTE_OPTION_UNSPECIFIED]: "",
    [Vote.Option.UNRECOGNIZED]: "",
  }

  const getVoteOptionItem = useGetVoteOptionItem()

  const [tab, setTab] = useState<Vote.Option>()
  const [delegatedOnly, setDelegatedOnly] = useState(false)

  const { data: delegations, ...delegationsState } = useDelegations(chainID)
  const { data: TerraProposal, ...TerraProposalState } = useTerraProposal(id)
  const { data: TerraValidators, ...TerraValidatorsState } =
    useValidators(chainID)

  const state = combineState(
    delegationsState,
    TerraProposalState,
    TerraValidatorsState
  )

  const getList = useCallback(
    (tab?: Vote.Option) => {
      if (!(delegations && TerraProposal && TerraValidators)) return []

      const getIsDelegated = (address: ValAddress) => {
        return delegations.some(
          ({ validator_address }) => validator_address === address
        )
      }

      const getHasVoted = (address: ValAddress, option?: Vote.Option) => {
        return TerraProposal.some(({ voter, options }) => {
          if (ValAddress.fromAccAddress(voter, "terra") !== address)
            return false

          const voted = options.some(
            (o) => (Vote.Option[o.option] as unknown as Vote.Option) === option
          )

          return !option || voted
        })
      }

      return TerraValidators.filter(({ operator_address, status }) => {
        if (getIsUnbonded(status)) return false
        if (delegatedOnly && !getIsDelegated(operator_address)) return false
        if (!tab) return !getHasVoted(operator_address)
        return getHasVoted(operator_address, tab)
      })
    },
    [TerraProposal, TerraValidators, delegatedOnly, delegations]
  )

  const getCount = useCallback(
    (tab?: Vote.Option) => getList(tab).length,
    [getList]
  )

  const render = () => {
    if (!(delegations && TerraProposal && TerraValidators)) return null

    const calcRate = getCalcVotingPowerRate(TerraValidators)

    const dataSource = getList(tab)
      .map((validator) => {
        const voting_power_rate = calcRate(validator.operator_address)
        return { ...validator, voting_power_rate }
      })
      .sort((a, b) => Number(b.voting_power_rate) - Number(a.voting_power_rate))

    return (
      <Grid gap={24}>
        <div className={styles.filter}>
          <section className={styles.tabs}>
            <div className={styles.inner}>
              <button
                className={cx(styles.tab, { active: !tab })}
                onClick={() => setTab(undefined)}
              >
                {t("Did not vote")} ({getCount()})
              </button>

              {options.map((key) => {
                const { label } = getVoteOptionItem(key)
                return (
                  <Tooltip content={tooltipContents[key]} key={key}>
                    <button
                      className={cx(styles.tab, { active: tab === key })}
                      onClick={() => setTab(key)}
                    >
                      {label} ({getCount(key)})
                    </button>
                  </Tooltip>
                )
              })}
            </div>
          </section>

          {delegations.length > 0 && (
            <Checkbox
              checked={delegatedOnly}
              onChange={() => setDelegatedOnly(!delegatedOnly)}
            >
              {t("View my validators only")}
            </Checkbox>
          )}
        </div>

        {!dataSource.length ? (
          <Empty />
        ) : (
          <Table
            columns={[
              {
                title: t("Validator"),
                dataIndex: ["description", "moniker"],
                render: (moniker, { operator_address }) => (
                  <Link to={`/validator/${operator_address}`}>{moniker}</Link>
                ),
              },
              {
                title: t("Voting power"),
                dataIndex: "voting_power_rate",
                render: (value) => readPercent(value),
                align: "right",
              },
              {
                title: t("Contact"),
                dataIndex: ["contact", "email"],
                render: (value) => (
                  <ExternalLink
                    href={`mailto:${value}`}
                    className={cx(styles.link, { disabled: !value })}
                    disabled={!value}
                  >
                    <EmailOutlinedIcon fontSize="small" />
                  </ExternalLink>
                ),
                align: "right",
              },
            ]}
            dataSource={dataSource}
            pagination={5}
            size="small"
            key={tab}
          />
        )}
      </Grid>
    )
  }

  if (!TerraProposal?.length) return null

  return (
    <Card {...state} title={t("Validators")} bordered twoTone>
      {render()}
    </Card>
  )
}

export default ProposalVotesByValidator
