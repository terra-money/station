import styles from "./SimpleChainList.module.scss"
import { useBankBalance } from "data/queries/bank"
import classNames from "classnames"

interface Props {
  list: InterchainNetwork[]
  onClick: () => void
}

const cx = classNames.bind(styles)

const SimpleChainList = ({ list, onClick }: Props) => {
  const coins = useBankBalance()
  const coinChains = coins.map((coin) => coin.chain)
  return (
    <div className={styles.options}>
      <div className={styles.options__container}>
        {list.map(({ chainID, name, icon }) => (
          <button
            key={chainID}
            className={cx(styles.button, {
              active: coinChains.includes(chainID),
            })}
            onClick={onClick}
          >
            <img src={icon} alt={name} />
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SimpleChainList
