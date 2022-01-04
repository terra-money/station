import { useTranslation } from "react-i18next"
import { useThemeAnimation } from "data/settings/Theme"
import { FlexColumn } from "components/layout"
import { sandbox } from "../scripts/env"
import styles from "./Splash.module.scss"

const Splash = () => {
  const { t } = useTranslation()
  const animation = useThemeAnimation()

  return !sandbox ? null : (
    <FlexColumn gap={20} className={styles.screen}>
      <img src={animation} alt="" width={80} height={80} />
      <h1>{t("Initializing app...")}</h1>
    </FlexColumn>
  )
}

export default Splash
