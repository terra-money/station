import { useState } from "react"
import styles from "./TokenSelector.module.scss"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import TokenList from "./TokenList"
import { Popover } from "components/display"

export interface TokenInterface {
  token: string
  symbol: string
  icon?: string
  name?: string
}

interface Props {
  tokenLists: Record<string, TokenInterface>
  onChange: (chain?: string) => void
  value?: string
}

const TokenSelector = ({ tokenLists, onChange, value }: Props) => {
  const [key, setKey] = useState(0)
  const closePopover = () => setKey((key) => key + 1)

  return (
    <Popover
      className={styles.popover}
      theme="none"
      maxWidth={200}
      key={key}
      placement="bottom"
      content={
        <TokenList
          list={tokenLists}
          onChange={(val) => {
            onChange(val)
            closePopover()
          }}
          value={value}
        />
      }
    >
      <button className={styles.selector}>
        {value ? (
          <span>
            <img
              src={tokenLists[value]?.icon}
              alt={tokenLists[value]?.symbol}
            />{" "}
            {tokenLists[value]?.symbol}
          </span>
        ) : (
          <span>Show all</span>
        )}
        <ArrowDropDownIcon style={{ fontSize: 20 }} className={styles.caret} />
      </button>
    </Popover>
  )
}

export default TokenSelector
