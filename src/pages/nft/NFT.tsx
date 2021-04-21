import { useTranslation } from "react-i18next"
import { Auto, Page } from "components/layout"
import NFTAssets from "./NFTAssets"
import NFTMarketplace from "./NFTMarketplace"

const NFT = () => {
  const { t } = useTranslation()

  return (
    <Page title={t("NFT")}>
      <Auto columns={[<NFTAssets />, <NFTMarketplace />]} />
    </Page>
  )
}

export default NFT
