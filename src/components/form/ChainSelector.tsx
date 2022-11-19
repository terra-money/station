import { useEffect, useState } from "react"
import styles from "./ChainSelector.module.scss"
import { useChains } from "data/queries/chains"

interface Props {
  chainsList: string[]
  onChange: (chain: string) => void
}

const ChainSelector = ({ chainsList, onChange }: Props) => {
  const chains = useChains()
  const list = Object.values(chains)
    .filter((c) => chainsList.includes(c.chainID))
    .sort((a, b) => {
      if (a.name === "Terra") return -1
      if (b.name === "Terra") return 1
      return 0
    })
  const [chain, setChain] = useState(list[0].chainID)

  useEffect(() => {
    onChange(chain)
    // eslint-disable-next-line
  }, [chain])

  return (
    <div className={styles.chain__selector}>
      {list.map(({ chainID, name }) => (
        <button
          className={chainID === chain ? styles.active : ""}
          key={chainID}
          onClick={(e) => {
            e.preventDefault()
            setChain(chainID)
          }}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

export default ChainSelector
