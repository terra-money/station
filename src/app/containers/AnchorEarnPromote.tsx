import { FC } from "react"
import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { useAnchorAPY } from "data/earn/anchor"
import { Card } from "components/layout"
import AnchorEarnLogo from "styles/images/AnchorEarn/AnchorEarnLogo"
import styles from "./AnchorEarnPromote.module.scss"

const AnchorEarnPromote: FC = ({ children }) => {
  const { t } = useTranslation()
  const { data: apy, ...state } = useAnchorAPY()

  return (
    <Card {...state} title={<AnchorEarnLogo />} className={styles.card}>
      {apy && (
        <header className={styles.header}>
          {t("APY")} <strong>{readPercent(apy)}</strong>
        </header>
      )}

      <p>
        {t(
          "Anchor is a savings protocol that offers stable yields on UST deposits"
        )}
      </p>

      {children && <footer className={styles.footer}>{children}</footer>}
    </Card>
  )
}

export default AnchorEarnPromote
