import classNames from "classnames"
import { useNetwork } from "data/wallet"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import styles from "./ChainFilter.module.scss"

const ChainFilter = ({
  children,
  all,
  outside,
  title,
  className,
  swap,
}: {
  children: (chain?: string) => React.ReactNode
  all?: boolean
  outside?: boolean
  title?: string
  className?: string
  swap?: boolean
}) => {
  const { t } = useTranslation()
  const networks = Object.values(useNetwork()).sort((a, b) =>
    a.name === "Terra" ? -1 : b.name === "Terra" ? 1 : 0
  )
  const [selectedChain, setChain] = useState<string | undefined>(
    all ? undefined : networks[0].chainID
  )

  return (
    <div className={outside ? styles.chainfilter__out : styles.chainfilter}>
      <div
        className={classNames(
          className,
          styles.header,
          swap ? styles.swap : ""
        )}
      >
        {title && <h1>{title}</h1>}
        <div className={styles.pills}>
          {all && (
            <button
              onClick={() => setChain(undefined)}
              className={`${styles.all} ${selectedChain ?? styles.active}`}
            >
              {t("All")}
            </button>
          )}
          {swap && (
            <button
              key={networks[0].chainID}
              onClick={() => setChain(networks[0].chainID)}
              className={
                selectedChain === networks[0].chainID
                  ? styles.active
                  : undefined
              }
            >
              <img src={networks[0].icon} alt={networks[0].name} />
              {networks[0].name}
            </button>
          )}
          {!swap &&
            networks.map((chain) => (
              <button
                key={chain.chainID}
                onClick={() => setChain(chain.chainID)}
                className={
                  selectedChain === chain.chainID ? styles.active : undefined
                }
              >
                <img src={chain.icon} alt={chain.name} />
                {chain.name}
              </button>
            ))}
        </div>
      </div>
      <div className={styles.content}>{children(selectedChain)}</div>
    </div>
  )
}

export default ChainFilter
