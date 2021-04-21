import { useTranslation } from "react-i18next"
import classNames from "classnames"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import Flex from "./Flex"
import styles from "./PaginationButtons.module.scss"

interface Props {
  current: number
  total: number
  onPrev?: () => void
  onNext?: () => void
}

const PaginationButtons = ({ onPrev, onNext, current, total }: Props) => {
  const { t } = useTranslation()

  return (
    <Flex className={styles.group}>
      <button
        className={classNames(styles.button, styles.prev)}
        onClick={onPrev}
        disabled={!onPrev}
      >
        <ArrowBackIosNewIcon style={{ fontSize: 8 }} />
      </button>

      <span className={styles.status}>
        {t("{{n}} of {{d}}", { n: current, d: total })}
      </span>

      <button
        className={classNames(styles.button, styles.next)}
        onClick={onNext}
        disabled={!onNext}
      >
        <ArrowForwardIosIcon style={{ fontSize: 8 }} />
      </button>
    </Flex>
  )
}

export default PaginationButtons
