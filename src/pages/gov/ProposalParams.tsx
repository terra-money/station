import { useTranslation } from "react-i18next"
import { readPercent } from "@terra-money/terra-utils"
import { useTallyParams } from "data/queries/gov"
import { Card } from "components/layout"
import DataList from "./components/DataList"

const ProposalParams = ({ chain }: { chain: string }) => {
  const { t } = useTranslation()
  const { data: tallyParams, ...state } = useTallyParams(chain)

  const render = () => {
    if (!tallyParams) return null
    const { quorum, threshold, veto_threshold } = tallyParams
    const contents = [
      {
        title: t("Quorum"),
        content: readPercent(quorum.toString()),
      },
      {
        title: t("Pass threshold"),
        content: readPercent(threshold.toString()),
      },
      {
        title: t("Veto threshold"),
        content: readPercent(veto_threshold.toString()),
      },
    ]

    return <DataList list={contents} type="horizontal" />
  }

  return (
    <Card {...state} title={t("Tallying procedure")} bordered twoTone>
      {render()}
    </Card>
  )
}

export default ProposalParams
