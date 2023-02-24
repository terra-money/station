import { Empty } from "components/feedback"
import { Flex } from "components/layout"
import { TokenCard, TokenIcon } from "components/token"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import getRecord from "utils/getRecord"
import useBoolean from "utils/hooks/useBoolean"
import { getTokenId, SwapToken } from "../CurrentChainTokensProvider"
import styles from "./TokenInput.module.scss"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"

interface TokenInputProps {
  value?: string
  onChange: (value: string) => void
  options: SwapToken[]

  addonAfter?: ReactNode
}

export const TokenInput = ({
  value,
  onChange,
  options,
  addonAfter,
}: TokenInputProps) => {
  const { t } = useTranslation()
  const [isOpen, { toggle, unset: close }] = useBoolean(false)

  const [keyword, setKeyword] = useState("")
  const filteredOptions = options.filter(({ symbol, name }) => {
    if (!keyword) return true

    return [symbol, name].some(
      (k) => k && k.toLowerCase().includes(keyword.toLowerCase())
    )
  })

  const renderList = () => {
    if (keyword && !filteredOptions.length) {
      return (
        <div className={styles.empty}>
          <Empty />
        </div>
      )
    }

    return (
      <div className={styles.tokens}>
        {filteredOptions.map((token) => (
          <button
            key={getTokenId(token)}
            type="button"
            onClick={() => {
              onChange(getTokenId(token))
              close()
            }}
          >
            <TokenCard
              token={getTokenId(token)}
              className={styles.item}
              name={token.name}
              icon={token.icon}
              decimals={token.decimals}
              symbol={token.symbol}
            />
          </button>
        ))}
      </div>
    )
  }

  const renderSelectedToken = () => {
    if (!value) return t("Select a coin")

    const tokensRecord = getRecord(options, getTokenId)
    const token = tokensRecord[value]

    return (
      <>
        <TokenIcon token={value} icon={token.icon} />
        {token.symbol}
      </>
    )
  }

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
