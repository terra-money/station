import { useTranslation } from "react-i18next"
import { useThemeAnimation } from "data/settings/Theme"
import { FlexColumn } from "components/layout"
import { sandbox } from "../scripts/env"
import styles from "./Splash.module.scss"
import classNames from "classnames/bind"

interface Props {
  inCard?: boolean
}

const cx = classNames.bind(styles)

const PageLoading = ({ inCard }: Props) => {
  const { t } = useTranslation()
  const animation = useThemeAnimation()

  return !sandbox ? null : (
    <FlexColumn gap={20} className={cx(styles.page, { inCard })}>
      <img src={animation} alt="" width={80} height={80} />
      <h1>{t("Loading...")}</h1>
    </FlexColumn>
  )
}

export default PageLoading
