import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { flatten } from "ramda"
import classNames from "classnames/bind"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import SearchIcon from "@mui/icons-material/Search"
import createContext from "utils/createContext"
import { Flex, Grid } from "components/layout"
import { Empty } from "components/feedback"
import { TokenCard, TokenCardGrid, TokenIcon } from "components/token"
import styles from "./SelectToken.module.scss"

const cx = classNames.bind(styles)

interface GroupProps {
  title: string
  children: ItemProps[]
  showName?: boolean
}

const SelectTokenGroup = ({ title, children, showName }: GroupProps) => {
  return !children.filter(({ hidden }) => !hidden).length ? null : (
    <article>
      <h1 className={styles.title}>{title}</h1>
      <TokenCardGrid singleColumn={showName}>
        {children.map((item) => (
          <SelectTokenItem {...item} showName={showName} key={item.value} />
        ))}
      </TokenCardGrid>
    </article>
  )
}

interface ItemProps extends TokenItem {
  balance?: string
  value: string
  muted?: boolean
  hidden?: boolean
  showName?: boolean
}

const SelectTokenItem = (props: ItemProps) => {
  const { value, balance, muted, hidden, showName } = props
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
        name={showName ? props.name : undefined /* Hide name */}
        value={undefined /* To avoid put the `option` value */}
      />
    </button>
  )
}

interface Props {
  value?: string
  onChange: (value: string) => void
  options: GroupProps[]
  addonAfter: ReactNode // input
  checkbox?: ReactNode
  showName?: boolean
}

interface Value {
  hideBalance: boolean
  selectToken: Props["onChange"]
}

const [useSelectToken, SelectTokenProvider] =
  createContext<Value>("useSelectToken")

const SelectToken = ({ value: selected, onChange, ...props }: Props) => {
  const { options, addonAfter, checkbox, showName } = props
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  const selectToken = (value: string) => {
    if (value !== selected) onChange(value)
    toggle()
  }

  const [keyword, setKeyword] = useState("")

  const items = flatten(
    Object.values(options.map(({ children }) => children) ?? {})
  )
  const current = items.find((item) => item.value === selected)
  const byKeyword = items.filter((item) =>
    [item.value, item.symbol].some((k) =>
      k.toLowerCase().includes(keyword.toLowerCase())
    )
  )

  const empty = !byKeyword.length

  return (
    <SelectTokenProvider value={{ hideBalance: !checkbox, selectToken }}>
      <div className={styles.component}>
        <Flex>
          <button type="button" className={styles.toggle} onClick={toggle}>
            {current ? (
              <>
                <TokenIcon token={current.token} icon={current.icon} />
                {current.symbol}
              </>
            ) : (
              t("Select a coin")
            )}

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

            <Grid gap={20} className={cx(styles.list, { empty })}>
              {keyword ? (
                empty ? (
                  <Empty />
                ) : (
                  <TokenCardGrid singleColumn={showName}>
                    {byKeyword.map((item) => (
                      <SelectTokenItem
                        {...item}
                        showName={showName}
                        key={item.value}
                      />
                    ))}
                  </TokenCardGrid>
                )
              ) : (
                <>
                  {checkbox && (
                    <section className={cx(styles.checkbox)}>
                      {checkbox}
                    </section>
                  )}

                  {options.map((option) => (
                    <SelectTokenGroup
                      {...option}
                      showName={showName}
                      key={option.title}
                    />
                  ))}
                </>
              )}
            </Grid>
          </section>
        )}
      </div>
    </SelectTokenProvider>
  )
}

export default SelectToken
