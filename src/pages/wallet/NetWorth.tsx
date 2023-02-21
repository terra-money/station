import { Button } from "components/general"
import { Read } from "components/token"
import { TooltipIcon } from "components/display"
import { useBankBalance } from "data/queries/bank"
import { useExchangeRates } from "data/queries/coingecko"
import { useCurrency } from "data/settings/Currency"
import { useNativeDenoms } from "data/token"
import { useTranslation } from "react-i18next"
import styles from "./NetWorth.module.scss"
import { useWalletRoute, Path } from "./Wallet"
import { capitalize } from "@mui/material"
import NetWorthTooltip from "./NetWorthTooltip"

const NetWorth = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const coins = useBankBalance()
  const { data: prices } = useExchangeRates()
  const readNativeDenom = useNativeDenoms()
  const { setRoute, route } = useWalletRoute()

  // TODO: show CW20 balances and staked tokens
  const coinsValue = coins?.reduce((acc, { amount, denom }) => {
    const { token, decimals, symbol } = readNativeDenom(denom)
    return (
      acc +
      (parseInt(amount) *
        (symbol?.endsWith("...") ? 0 : prices?.[token]?.price ?? 0)) /
        10 ** decimals
    )
  }, 0)

  return (
    <article className={styles.networth}>
      <TooltipIcon content={<NetWorthTooltip />} placement="bottom">
        <p>{capitalize(t("portfolio value"))}</p>
      </TooltipIcon>
      <h1>
        {currency.symbol}{" "}
        <Read amount={coinsValue} decimals={0} fixed={2} denom="" token="" />
      </h1>
      <div className={styles.networth__buttons}>
        <Button
          color="primary"
          onClick={() =>
            setRoute({
              path: Path.send,
              previusPage: route,
            })
          }
        >
          {capitalize(t("Send"))}
        </Button>
        <Button
          onClick={() =>
            setRoute({
              path: Path.receive,
              previusPage: route,
            })
          }
        >
          {capitalize(t("receive"))}
        </Button>
      </div>
    </article>
  )
}

export default NetWorth
