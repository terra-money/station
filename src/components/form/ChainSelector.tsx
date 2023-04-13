import { useMemo, useState } from "react"
import styles from "./ChainSelector.module.scss"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import { useNetworks } from "app/InitNetworks"
import ChainList from "./ChainList"

interface Props {
  chainsList: string[]
  onChange: (chain: string) => void
  value: string
  small?: boolean
  noSearch?: boolean
}

const ChainSelector = ({
  chainsList,
  onChange,
  value,
  small,
  noSearch,
}: Props) => {
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
      {open && <ChainList list={list} onChange={onChange} value={value} />}
    </div>
  )
}

export default ChainSelector
