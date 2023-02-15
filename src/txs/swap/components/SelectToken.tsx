import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import createContext from "utils/createContext"
import { Flex } from "components/layout"
import { TokenCard, TokenIcon } from "components/token"
import styles from "./SelectToken.module.scss"
import { useTFMTokens } from "data/external/multichainTfm"
import getRecord from "utils/getRecord"
import { Empty } from "components/feedback"

const cx = classNames.bind(styles)

interface ItemProps extends TokenItem {
  balance?: string
  value: string
  muted?: boolean
  hidden?: boolean
}

const SelectTokenItem = (props: ItemProps) => {
  const { value, balance, muted, hidden } = props
  const { hideBalance, selectToken } = useSelectToken()

  return hidden ? null : (
    <button
      type="button"
      className={cx(styles.button, { muted })}
      onClick={() => selectToken(value)}
    >
      <TokenCard
        {...props}
        className={styles.item}
        balance={hideBalance ? undefined : balance}
        name={props.name}
      />
    </button>
  )
}

interface Props {
  value?: string
  onChange: (value: string) => void
  addonAfter: ReactNode // input
  checkbox?: ReactNode
  chainId: string
}

interface Value {
  hideBalance: boolean
  selectToken: Props["onChange"]
}

const [useSelectToken, SelectTokenProvider] =
  createContext<Value>("useSelectToken")

const SelectToken = ({ value: selected, onChange, ...props }: Props) => {
  const { addonAfter, checkbox, chainId } = props
  const { t } = useTranslation()

  const { data: tokens = [] } = useTFMTokens(chainId)

  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  const selectToken = (value: string) => {
    if (value !== selected) onChange(value)
    toggle()
  }

  const [keyword, setKeyword] = useState("")

  const filteredTokens = tokens.filter(({ contract_addr, symbol, name }) => {
    if (!keyword) return true

    return [contract_addr, symbol, name].some((k) =>
      k.toLowerCase().includes(keyword.toLowerCase())
    )
  })

  const renderList = () => {
    if (keyword && !filteredTokens.length) {
      return <Empty />
    }

    return (
      <>
        {checkbox && !keyword && (
          <section className={cx(styles.checkbox)}>{checkbox}</section>
        )}
        <div className={styles.tokens}>
          {filteredTokens.map(({ contract_addr, decimals, symbol }) => (
            <SelectTokenItem
              key={contract_addr}
              value={contract_addr}
              token={contract_addr}
              decimals={decimals}
              symbol={symbol}
            />
          ))}
        </div>
      </>
    )
  }

  const renderSelectedToken = () => {
    if (!selected) return t("Select a coin")

    const tokensRecord = getRecord(tokens, (token) => token.contract_addr)
    const token = tokensRecord[selected]
    if (!token) return null

    return (
      <>
        <TokenIcon token={token.contract_addr} />
        {token.symbol}
      </>
    )
  }

  return (
    <SelectTokenProvider value={{ hideBalance: !checkbox, selectToken }}>
      <Flex>
        <button type="button" className={styles.toggle} onClick={toggle}>
          {renderSelectedToken()}

          <ArrowDropDownIcon style={{ fontSize: 18 }} />
        </button>

        {addonAfter}
      </Flex>

      {isOpen && (
        <section>
          <Flex className={styles.search}>
            <SearchIcon />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder=""
              autoComplete="off"
              autoFocus
            />
          </Flex>

          <div className={styles.content}>{renderList()}</div>
        </section>
      )}
    </SelectTokenProvider>
  )
}

export default SelectToken
