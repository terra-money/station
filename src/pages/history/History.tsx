import { useTranslation } from "react-i18next"
import { useIsTerraAPIAvailable } from "data/Terra/TerraAPI"
import { Wrong } from "components/feedback"
import HistoryList from "./HistoryList"

const History = () => {
  const { t } = useTranslation()
  const available = useIsTerraAPIAvailable()

  if (!available) return <Wrong>{t("History is not supported")}</Wrong>

  return <HistoryList />
}

export default History
