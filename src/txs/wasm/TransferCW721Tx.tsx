import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { Page } from "components/layout"
import TransferCW721Form from "./TransferCW721Form"

const TransferCW721Tx = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const contract = searchParams.get("contract")
  const id = searchParams.get("id")

  if (!(contract && id)) throw new Error("Invalid")

  return (
    <Page title={t("Transfer NFT")}>
      <TransferCW721Form contract={contract} id={id} />
    </Page>
  )
}

export default TransferCW721Tx
