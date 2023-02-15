import { ReactNode, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import classNames from "classnames/bind"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import { Flex } from "components/layout"
import { TokenCard, TokenIcon } from "components/token"
import styles from "./SelectToken.module.scss"
import { TFMToken, useTFMTokens } from "data/external/multichainTfm"
import { Empty } from "components/feedback"
import getRecord from "utils/getRecord"

const cx = classNames.bind(styles)

interface Props {
  value?: TFMToken
  onChange: (value: TFMToken) => void
  addonAfter: ReactNode // input
  checkbox?: ReactNode
  chainId: string
}

const chainDefaultAsset: Record<string, string> = {
  "phoenix-1": "uluna",
  "osmosis-1": "uosmo",
}

const SelectToken = ({ value: selected, onChange, ...props }: Props) => {
  const { addonAfter, checkbox, chainId } = props
  const { t } = useTranslation()

  const { data: tokens = [] } = useTFMTokens(chainId)

  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)

  const [keyword, setKeyword] = useState("")

  const filteredTokens = tokens.filter(({ contract_addr, symbol, name }) => {
    if (!keyword) return true

    return [contract_addr, symbol, name].some((k) =>
      k.toLowerCase().includes(keyword.toLowerCase())
    )
  })

  useEffect(() => {
    if (!selected && tokens) {
      const tokensRecord = getRecord(tokens, (t) => t.contract_addr)
      const token = tokensRecord[chainDefaultAsset[chainId]]
      if (token) {
        onChange(token)
      }
    }
  }, [chainId, onChange, selected, tokens])

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
          {filteredTokens.map((token) => (
            <button
              key={token.contract_addr}
              type="button"
              onClick={() => onChange(token)}
            >
              <TokenCard
                token={token.contract_addr}
                className={styles.item}
                name={token.name}
              />
            </button>
          ))}
        </div>
      </>
    )
  }

  const renderSelectedToken = () => {
    if (!selected) return t("Select a coin")

    return (
      <>
        <TokenIcon token={selected.contract_addr} />
        {selected.symbol}
      </>
    )
  }

  // const hideBalance = !checkbox

  return (
    <>
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
    </>
  )
}

export default SelectToken
