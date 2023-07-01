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
import { ModalButton } from "components/feedback"
import FiatRampModal from "./FiatRampModal"
// import { Add as AddIcon, Send as SendIcon } from "@mui/icons-material"
import classNames from "classnames"
import { useInterchainAddresses } from "auth/hooks/useAddress"
import { useNetworkName } from "data/wallet"
import { ReactComponent as SendIcon } from "styles/images/icons/Send_v2.svg"
import { ReactComponent as ReceiveIcon } from "styles/images/icons/Receive_v2.svg"
import { ReactComponent as AddIcon } from "styles/images/icons/Buy_v2.svg"

const cx = classNames.bind(styles)

const NetWorth = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const coins = useBankBalance()
  const { data: prices } = useExchangeRates()
  const readNativeDenom = useNativeDenoms()
  const { setRoute, route } = useWalletRoute()
  const addresses = useInterchainAddresses()
  const networkName = useNetworkName()

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
        <Read
          className={styles.amount}
          amount={coinsValue}
          decimals={0}
          fixed={2}
          denom=""
          token=""
        />
      </h1>
      <div className={styles.networth__buttons}>
        <div className={styles.button__wrapper}>
          <Button
            color="primary"
            className={styles.wallet_primary}
            onClick={() =>
              setRoute({
                path: Path.send,
                previousPage: route,
              })
            }
          >
            <SendIcon className={cx(styles.icon, styles.send)} />
          </Button>
          <h3>{capitalize(t("send"))}</h3>
        </div>
        <div className={styles.button__wrapper}>
          <Button
            className={styles.wallet_default}
            onClick={() =>
              setRoute({
                path: Path.receive,
                previousPage: route,
              })
            }
          >
            <ReceiveIcon className={cx(styles.icon, styles.receive)} />
          </Button>
          <h3>{capitalize(t("receive"))}</h3>
        </div>
        {addresses && networkName === "mainnet" && (
          <div className={styles.button__wrapper}>
            <ModalButton
              minimal
              renderButton={(open) => (
                <Button className={styles.wallet_default} onClick={open}>
                  <AddIcon className={styles.icon} />
                </Button>
              )}
            >
              <FiatRampModal />
            </ModalButton>
            <h2>{t(capitalize("buy"))}</h2>
          </div>
        )}
      </div>
    </article>
  )
}

export default NetWorth
