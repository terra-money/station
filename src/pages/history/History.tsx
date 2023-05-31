import { useTranslation } from "react-i18next"
import HistoryList from "./HistoryList"
import { ChainFilter, Page } from "components/layout"

const History = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("History")}>
      <ChainFilter outside all>
        {(chain) => <HistoryList chainID={chain} />}
      </ChainFilter>
    </Page>
  )
}

export default History
