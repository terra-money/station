import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { MnemonicKey } from "@terra-money/terra.js"
import { Card, Page } from "components/layout"
import CreateWalletWizard from "./CreateWalletWizard"
import Quiz from "./Quiz"

const NewWallet = () => {
  const { t } = useTranslation()
  const { mnemonic } = useMemo(() => new MnemonicKey(), []) // must be memoized

  return (
    <Page title={t("New wallet")} small>
      <Card>
        <CreateWalletWizard
          defaultMnemonic={mnemonic}
          beforeCreate={<Quiz />}
        />
      </Card>
    </Page>
  )
}

export default NewWallet
