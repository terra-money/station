import { useTranslation } from "react-i18next"
import { Auto, Page } from "components/layout"
import Coins from "./Coins"
import Tokens from "./Tokens"
import Vesting from "./Vesting"
import Rewards from "./Rewards"
import is from "auth/scripts/is"

const Wallet = () => {
  const { t } = useTranslation()

  return (
    <Page title={is.mobile() ? "" : t("Wallet")}>
      <Auto
        columns={[
          <>
            <Coins />
            <Tokens />
            <Vesting />
          </>,
          <>{!is.mobile() && <Rewards />}</>,
        ]}
      />
    </Page>
  )
}

export default Wallet
