import { useTranslation } from "react-i18next"
import { useIsAnchorAvailable } from "data/external/anchor"
import { Auto, Page } from "components/layout"
import Coins from "./Coins"
import Tokens from "./Tokens"
import Rewards from "./Rewards"
import AnchorEarn from "./AnchorEarn"
import is from "auth/scripts/is"

const Wallet = () => {
  const isAnchorAvailable = useIsAnchorAvailable()
  const { t } = useTranslation()

  return (
    <Page title={is.mobile() ? "" : t("Wallet")}>
      <Auto
        columns={[
          <>
            <Coins />
            <Tokens />
          </>,
          <>
            <Rewards />
            {isAnchorAvailable && <AnchorEarn />}
          </>,
        ]}
      />
    </Page>
  )
}

export default Wallet
