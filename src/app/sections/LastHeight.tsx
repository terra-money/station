import { useTranslation } from "react-i18next"
import classNames from "classnames"
import { formatNumber } from "@terra.kitchen/utils"
import { useTerraObserver } from "data/Terra/TerraObserver"
import { FinderLink } from "components/general"
import { Flex } from "components/layout"
import styles from "./LastHeight.module.scss"

const LastHeight = () => {
  const { t } = useTranslation()
  const { block } = useTerraObserver()
  const height = block?.header.height

  return (
    <Flex gap={4} className={styles.component} start>
      <div
        className={classNames(
          styles.indicator,
          height ? styles.success : styles.loading
        )}
      />

      {height ? (
        <FinderLink className={styles.link} value={height} block>
          #{formatNumber(height, { comma: true })}
        </FinderLink>
      ) : (
        <p className={styles.text}>{t("Loading...")}</p>
      )}
    </Flex>
  )
}

export default LastHeight
