import { useTranslation } from "react-i18next"
import { Card, Page } from "components/layout"
import { Wrong } from "components/feedback"
import { isWallet, useAuth } from "auth"
import useDefaultValues from "./utils/useDefaultValues"
import SignMultisigTxForm from "./SignMultisigTxForm"

const SignMultisigTxPage = () => {
  const { t } = useTranslation()
  const { wallet } = useAuth()
  const defaultValues = useDefaultValues()

  const render = () => {
    if (isWallet.multisig(wallet))
      return (
        <Card>
          <Wrong>{t("Multisig wallet cannot sign a tx")}</Wrong>
        </Card>
      )

    return <SignMultisigTxForm defaultValues={defaultValues} />
  }

  return (
    <Page backButtonPath="/" title={t("Sign a multisig tx")}>
      {render()}
    </Page>
  )
}

export default SignMultisigTxPage
