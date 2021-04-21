import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { useTallyParams } from "data/queries/gov"
import { Card } from "components/layout"
import DataList from "./components/DataList"

const ProposalParams = () => {
  const { t } = useTranslation()
  const { data: tallyParams, ...state } = useTallyParams()

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
    <Card {...state} title={t("Tallying procedure")} bordered>
      {render()}
    </Card>
  )
}

export default ProposalParams
