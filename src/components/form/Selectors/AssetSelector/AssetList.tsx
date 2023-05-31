import styles from "../../ChainSelector.module.scss"
import WithSearchInput from "pages/custom/WithSearchInput"
import classNames from "classnames"

interface AssetType {
  denom: string
  balance: string
  icon: string
  symbol: string
  price: number
  chains: string[]
}

interface Props {
  list: AssetType[]
  onChange: (symbol: string, index: number) => void
  value: string
  small?: boolean
  noSearch?: boolean
}

const ChainList = ({ list, onChange, value, small, noSearch }: Props) => {
  return (
    <div className={styles.options}>
      <WithSearchInput disabled={noSearch} inline gap={4}>
        {(search) => (
          <div
            className={classNames(
              styles.options__container,
              small && styles.options__container__small
            )}
          >
            {list
              .filter(
                ({ denom, symbol }) =>
                  denom.toLowerCase().includes(search.toLowerCase()) ||
                  symbol.toLowerCase().includes(search.toLowerCase())
              )
              .map(({ denom, symbol, icon }, index) => (
                <button
                  className={symbol === value ? styles.active : ""}
                  key={denom}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange(denom, index)
                  }}
                >
                  <img src={icon} alt={denom} />
                  {symbol}
                </button>
              ))}
          </div>
        )}
      </WithSearchInput>
    </div>
  )
}

export default ChainList
