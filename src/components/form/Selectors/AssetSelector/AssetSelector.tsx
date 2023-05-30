import { useState, useRef, useEffect } from "react"
import styles from "../../ChainSelector.module.scss"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import AssetList from "./AssetList"

interface AssetType {
  denom: string
  balance: string
  icon: string
  symbol: string
  price: number
  chains: string[]
}

interface Props {
  assetList: AssetType[]
  onChange: (chain: string) => void
  value: string
  small?: boolean
  noSearch?: boolean
}

const AssetSelector = ({
  assetList,
  onChange,
  value,
  small,
  noSearch,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setOpen(false)
    }
  }
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelection = (denom: string, index: number) => {
    setSelectedIndex(index)
    onChange(denom)
    setOpen(false)
  }

  return (
    <div className={styles.container} ref={ref}>
      <button
        type="button"
        className={styles.selector}
        onClick={(e) => {
          e.stopPropagation()
          if (e.screenX && e.screenY) setOpen((o) => !o) // negate onClick triggered by enter key press
        }}
      >
        <span>
          <img
            src={assetList[selectedIndex].icon}
            alt={assetList[selectedIndex]?.denom}
          />{" "}
          {assetList[selectedIndex]?.symbol}
        </span>{" "}
        <ArrowDropDownIcon style={{ fontSize: 20 }} className={styles.caret} />
      </button>
      {open && (
        <AssetList list={assetList} onChange={handleSelection} value={value} />
      )}
    </div>
  )
}

export default AssetSelector
