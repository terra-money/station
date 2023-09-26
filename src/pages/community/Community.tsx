import { Page } from "components/layout"
import { useTranslation } from "react-i18next"
import ChannelPage from "components/channel"
import PopoverProvider from "providers/popover"
import RavenProvider from "providers/raven"
import KeysProvider from "providers/keys"

export const Community = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("Community")}>
      <KeysProvider>
        <RavenProvider>
          <PopoverProvider>
            <ChannelPage></ChannelPage>
          </PopoverProvider>
        </RavenProvider>
      </KeysProvider>
    </Page>
  )
}
