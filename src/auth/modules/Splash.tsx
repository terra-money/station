import { useTranslation } from "react-i18next"
import { useTheme, useThemeAnimation } from "data/settings/Theme"
import { FlexColumn } from "components/layout"
import { sandbox } from "../scripts/env"
import styles from "./Splash.module.scss"
import classNames from "classnames/bind"

const cx = classNames.bind(styles)

const Splash = () => {
  const { t } = useTranslation()
  const animation = useThemeAnimation()
  const { name } = useTheme()

  return !sandbox ? null : (
    <FlexColumn gap={20} className={cx(styles.screen, { [name]: true })}>
      <img src={animation} alt="" width={80} height={80} />
      <h1>{t("Initializing app...")}</h1>
    </FlexColumn>
  )
}

export default Splash
