import styles from "../../ChainSelector.module.scss"
import WithSearchInput from "pages/custom/WithSearchInput"
import classNames from "classnames"
import { InterchainNetwork } from "types/network"

interface Props {
  list: InterchainNetwork[]
  onChange: (chain: string) => void
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
                ({ chainID, name }) =>
                  chainID.toLowerCase().includes(search.toLowerCase()) ||
                  name.toLowerCase().includes(search.toLowerCase())
              )
              .map(({ chainID, name, icon }) => (
                <button
                  className={chainID === value ? styles.active : ""}
                  key={chainID}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange(chainID)
                  }}
                >
                  <img src={icon} alt={name} />
                  {name}
                </button>
              ))}
          </div>
        )}
      </WithSearchInput>
    </div>
  )
}

export default ChainList
