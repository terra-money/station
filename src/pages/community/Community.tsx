import { Page } from "components/layout"
import { useTranslation } from "react-i18next"
import ChannelPage from "components/channel"
import PopoverProvider from "providers/popover"
import RavenProvider from "providers/raven"
import KeysProvider from "providers/keys"
import { useAtom } from "jotai"
import { keysAtom } from "utils/nostr/atoms"
import NostrLogin from "components/nostr-login"

export const Community = () => {
  const [keys] = useAtom(keysAtom)
  console.log("keys", keys)
  const { t } = useTranslation()

  return (
    <Page title={t("Community")}>
      <KeysProvider>
        <RavenProvider>
          <PopoverProvider>
            {keys ? <ChannelPage /> : <NostrLogin />}
          </PopoverProvider>
        </RavenProvider>
      </KeysProvider>
    </Page>
  )
}
