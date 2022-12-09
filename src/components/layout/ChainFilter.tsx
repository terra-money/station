import { useChains } from "data/queries/chains"
import { useState } from "react"
import styles from "./ChainFilter.module.scss"

const ChainFilter = ({
  children,
  all,
  outside,
  title,
}: {
  children: (chain?: string) => React.ReactNode
  all?: boolean
  outside?: boolean
  title?: string
}) => {
  const chains = Object.values(useChains()).sort((a, b) =>
    a.name === "Terra" ? -1 : b.name === "Terra" ? 1 : 0
  )
  const [selectedChain, setChain] = useState<string | undefined>(
    all ? undefined : chains[0].chainID
  )

  return (
    <div className={outside ? styles.chainfilter__out : styles.chainfilter}>
      <div className={styles.header}>
        {title && <h1>{title}</h1>}
        <div className={styles.pills}>
          {all && (
            <button
              onClick={() => setChain(undefined)}
              className={`${styles.all} ${selectedChain ?? styles.active}`}
            >
              All
            </button>
          )}
          {chains.map((chain) => (
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
