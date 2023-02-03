import { useMemo, useState } from "react"
import styles from "./ChainSelector.module.scss"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { useNetworks } from "app/InitNetworks"

interface Props {
  chainsList: string[]
  onChange: (chain: string) => void
  value: string
}

const ChainSelector = ({ chainsList, onChange, value }: Props) => {
  const { networks } = useNetworks()
  const allNetworks = useMemo(
    () => ({
      ...networks.localterra,
      ...networks.classic,
      ...networks.testnet,
      ...networks.mainnet,
    }),
    [networks]
  )

  const list = useMemo(
    () => chainsList.map((chainID) => allNetworks[chainID]),
    [allNetworks, chainsList]
  )
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.container}>
      <button
        className={styles.selector}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <span>
          <img src={allNetworks[value]?.icon} alt={allNetworks[value]?.name} />{" "}
          {allNetworks[value]?.name}
        </span>{" "}
        <ArrowDropDownIcon style={{ fontSize: 20 }} className={styles.caret} />
      </button>
      {open && (
        <div className={styles.options}>
          {list.map(({ chainID, name, icon }, i) => (
            <button
              className={chainID === value ? styles.active : ""}
              key={chainID}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(chainID)
                setOpen(false)
              }}
            >
              <img src={icon} alt={name} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ChainSelector
