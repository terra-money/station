import { useTranslation } from "react-i18next"
import { useAnchorTotalDeposit } from "data/earn/anchor"
import { has } from "utils/num"
import { getAmount } from "utils/coin"
import AnchorEarnLogo from "styles/images/AnchorEarn/AnchorEarnLogo"
import { useBankBalance } from "data/queries/bank"
import { LinkButton } from "components/general"
import { Card } from "components/layout"
import { Read } from "components/token"
import AnchorEarnPromote from "app/containers/AnchorEarnPromote"
import styles from "./AnchorEarn.module.scss"

const AnchorEarn = () => {
  const { t } = useTranslation()
  const { data: totalDeposit, ...state } = useAnchorTotalDeposit()
  const balance = useBankBalance()
  const uusd = getAmount(balance, "uusd")

  if (!totalDeposit) return null

  return has(totalDeposit) ? (
    <Card {...state} title={<AnchorEarnLogo />} mainClassName={styles.main}>
      <dl>
        <dt>{t("Deposited")}</dt>
        <dd>
          <Read amount={totalDeposit} token="uusd" />
        </dd>
      </dl>

      <LinkButton to="/earn" block>
        {t("Earn")}
      </LinkButton>
    </Card>
  ) : (
    <AnchorEarnPromote>
      <LinkButton to="/earn" block disabled={!has(uusd)}>
        {t("Earn")}
      </LinkButton>
    </AnchorEarnPromote>
  )
}

export default AnchorEarn
