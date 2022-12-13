import { useNetwork } from "data/wallet"
import { useEffect, useMemo, useState } from "react"
import styles from "./ChainSelector.module.scss"

interface Props {
  chainsList: string[]
  onChange: (chain: string) => void
}

const ChainSelector = ({ chainsList, onChange }: Props) => {
  const networks = useNetwork()
  const list = useMemo(
    () =>
      Object.values(networks)
        .filter((c) => chainsList.includes(c.chainID))
        .sort((a, b) => {
          if (a.name === "Terra") return -1
          if (b.name === "Terra") return 1
          return 0
        }),
    [networks, chainsList]
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    console.log("list", list)
    if (index >= list.length) setIndex(0)
  }, [list, index])

  useEffect(() => {
    onChange(list[index]?.chainID ?? "")
  }, [index]) // eslint-disable-line

  return (
    <div className={styles.chain__selector}>
      {list.map(({ chainID, name }, i) => (
        <button
          className={chainID === list[index]?.chainID ? styles.active : ""}
          key={chainID}
          onClick={(e) => {
            e.preventDefault()
            setIndex(i)
          }}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

export default ChainSelector
