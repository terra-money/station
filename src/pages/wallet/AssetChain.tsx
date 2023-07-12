import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import { useExchangeRates } from "data/queries/coingecko"
import { useCurrency } from "data/settings/Currency"
import { useNetwork, useNetworkName } from "data/wallet"
import { useTranslation } from "react-i18next"
import styles from "./AssetChain.module.scss"
import IbcSendBack from "./IbcSendBack"
import { CopyIcon, InternalButton } from "components/general"
import { Tooltip } from "components/display"
import { useDevMode } from "utils/localStorage"
import { truncate } from "@terra-money/terra-utils"
import { useNetworks } from "app/InitNetworks"

export interface Props {
  chain: string
  balance: string
  symbol: string
  decimals: number
  token: string
  denom: string
  path?: string[]
  ibcDenom?: string
}

const AssetChain = (props: Props) => {
  const { chain, symbol, balance, decimals, token, path, ibcDenom, denom } =
    props
  const currency = useCurrency()
  const { data: prices, ...pricesState } = useExchangeRates()
  const { t } = useTranslation()
  const networkName = useNetworkName()
  const allNetworks = useNetworks().networks[networkName]

  const networks = useNetwork()
  const { devMode } = useDevMode()

  const { icon, name } = allNetworks[chain] ?? { name: chain }

  let price
  if (symbol === "LUNC" && networkName !== "classic") {
    price = prices?.["uluna:classic"]?.price ?? 0
  } else {
    price = prices?.[token]?.price ?? 0
  }

  // send back is not available if one of the chains the asset went through is not supprted by Station
  const isSendBackDisabled =
    !!path?.find((chain) => !networks[chain]) ||
    (symbol === "LUNC" && networkName !== "classic")

  return (
    <article className={styles.chain} key={name}>
      <TokenIcon token={name} icon={icon} size={28} />
      <section className={styles.details}>
        <h1 className={styles.name}>
          <h4>
            {name}
            {ibcDenom &&
              path &&
              (isSendBackDisabled ? (
                <Tooltip
                  content={
                    <article>
                      <p>
                        {t(
                          "This asset originates from an unsupported chain and cannot be sent back."
                        )}
                      </p>
                    </article>
                  }
                >
                  <p className={styles.send__back__button__disabled}>
                    {t("Send back")}
                  </p>
                </Tooltip>
              ) : (
                <IbcSendBack
                  chainID={chain}
                  token={ibcDenom}
                  title={`Send ${symbol} back to ${
                    allNetworks[path[0]]?.name ?? path[0]
                  }`}
                >
                  {(open) => (
                    <InternalButton
                      onClick={() => !isSendBackDisabled && open()}
                      className={styles.send__back__button}
                      disabled={isSendBackDisabled}
                    >
                      {t("Send back")}
                    </InternalButton>
                  )}
                </IbcSendBack>
              ))}
          </h4>
          {path && (
            <p>{path.map((c) => allNetworks[c]?.name ?? c).join(" → ")}</p>
          )}
          {devMode && (
            <p>
              <span className={styles.copy__denom}>
                {truncate(denom)}
                <CopyIcon text={denom} size={14} />
              </span>
            </p>
          )}
        </h1>
        <h1 className={styles.price}>
          {currency.symbol}{" "}
          {price ? (
            <Read
              {...props}
              amount={price * parseInt(balance)}
              decimals={decimals}
              fixed={2}
              denom=""
              token=""
            />
          ) : (
            <span>—</span>
          )}
        </h1>
        <h2 className={styles.amount}>
          <WithFetching {...pricesState} height={1}>
            {(progress, wrong) => (
              <>
                {progress}
                {wrong ? (
                  <span className="danger">{t("Failed to query balance")}</span>
                ) : (
                  <Read
                    {...props}
                    amount={balance}
                    token=""
                    fixed={2}
                    decimals={decimals}
                  />
                )}
              </>
            )}
          </WithFetching>{" "}
          {symbol}
        </h2>
      </section>
    </article>
  )
}

export default AssetChain
