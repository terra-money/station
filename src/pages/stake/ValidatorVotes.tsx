import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { reverse } from "ramda"
import { readPercent } from "@terra-money/terra-utils"
import { TerraValidator } from "types/validator"
import { useGetVoteOptionItem } from "data/queries/gov"
import { useVotingPowerRate } from "data/Terra/TerraAPI"
import { Card, Grid, Table } from "components/layout"
import ValidatorNumbers from "./components/ValidatorNumbers"

const ValidatorVotes = ({ validator }: { validator: TerraValidator }) => {
  const { t } = useTranslation()
  const getVoteOptionItem = useGetVoteOptionItem()

  const { operator_address, votes } = validator

  const { data: votingPowerRate, ...votingPowerRateState } =
    useVotingPowerRate(operator_address)

  const contents = useMemo(() => {
    if (!votingPowerRate) return []
    return [{ title: t("Voting power"), content: readPercent(votingPowerRate) }]
  }, [t, votingPowerRate])

  return (
    <Card {...votingPowerRateState}>
      <Grid gap={20}>
        {contents && <ValidatorNumbers contents={contents} />}
        {votes && (
          <Table
            columns={[
              { dataIndex: "proposal_id", title: "ID" },
              {
                dataIndex: "title",
                title: "Title",
                render: (title, { proposal_id }) => {
                  return <Link to={`/proposal/${proposal_id}`}>{title}</Link>
                },
              },
              {
                dataIndex: "options",
                title: "Vote",
                render: (options) => {
                  return options
                    .map(({ option }: { option: string }) => {
                      const { label } = getVoteOptionItem(option)
                      return label
                    })
                    .join(", ")
                },
                align: "right",
              },
            ]}
            dataSource={reverse(votes)}
            pagination={5}
            size="small"
          />
        )}
      </Grid>
    </Card>
  )
}

export default ValidatorVotes
