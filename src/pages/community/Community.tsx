import { Page } from "components/layout"
import { useTranslation } from "react-i18next"
import { Chat } from "components/chat/Chat"

export const Community = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Community")}>
      <Chat></Chat>
    </Page>
  )
}
