import { Flex } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import TokenItem, { TokenItemProps } from "./TokenItem"
import styles from "./TokenList.module.scss"
import { Checkbox } from "components/form"
import { useState } from "react"
import {
  getLocalSetting,
  setLocalSetting,
  SettingKey,
} from "utils/localStorage"
import { useTranslation } from "react-i18next"

interface Props<T> extends QueryState {
  results: T[]
  renderTokenItem: (item: T) => TokenItemProps

  /* manage tokens */
  list: T[]
  getIsAdded: (item: T) => boolean
  add: (item: T) => void
  remove: (item: T) => void
}

function TokenList<T extends { symbol: string }>(props: Props<T>) {
  const { t } = useTranslation()
  const [hide, setHide] = useState(
    !!getLocalSetting(SettingKey.HideNonWhitelistTokens)
  )
  const { list, getIsAdded, add, remove, ...rest } = props
  const { results, renderTokenItem, ...state } = rest
  const empty = !state.isLoading && !results.length

  return state.error || empty ? (
    <Flex className={styles.results}>
      <Empty />
    </Flex>
  ) : (
    <Fetching {...state} height={2}>
      <Checkbox
        checked={!!hide}
        onChange={() => {
          setHide(!hide)
          setLocalSetting(SettingKey.HideNonWhitelistTokens, !hide)
        }}
      >
        {t("Hide non-whitelisted tokens")}
      </Checkbox>
      <ul className={styles.results}>
        {results
          .sort((a, b) => Number(getIsAdded(b)) - Number(getIsAdded(a)))
          .map((item) => {
            const tokenItem = renderTokenItem(item)
            return (
              <li key={tokenItem.key}>
                <TokenItem
                  {...tokenItem}
                  added={getIsAdded(item)}
                  onAdd={() => add(item)}
                  onRemove={() => remove(item)}
                />
              </li>
            )
          })}
      </ul>
    </Fetching>
  )
}

export default TokenList
