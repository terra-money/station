import RefreshIcon from "@mui/icons-material/Refresh"
import { Tooltip } from "components/display"
import { useTranslation } from "react-i18next"
import { useDisplayChains } from "utils/localStorage"
import { useBankBalance } from "data/queries/bank"
import styles from "./ChainButton.module.scss"

const ChainButton = () => {
  const { t } = useTranslation()
  const { changeDisplayChains } = useDisplayChains()
  const coins = useBankBalance()
  const coinChains = Array.from(new Set(coins.map((c) => c.chain)))

  return (
    <Tooltip content={t(`Scan and enable chains that have a token balance`)}>
      <button
        className={styles.refresh}
        onClick={() => changeDisplayChains(coinChains)}
      >
        <RefreshIcon style={{ fontSize: 16 }} />
      </button>
    </Tooltip>
  )
}

export default ChainButton
