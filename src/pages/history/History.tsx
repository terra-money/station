import { useTranslation } from "react-i18next"
import { useIsTerraAPIAvailable } from "data/Terra/TerraAPI"
import { Wrong } from "components/feedback"
import HistoryList from "./HistoryList"
import { ChainFilter, Page } from "components/layout"

const History = () => {
  const { t } = useTranslation()
  const available = useIsTerraAPIAvailable()

  if (!available) return <Wrong>{t("History is not supported")}</Wrong>

  return (
    <Page title={t("History")}>
      <ChainFilter outside>
        {(chain) => <HistoryList chainID={chain ?? ""} />}
      </ChainFilter>
    </Page>
  )
}

export default History
