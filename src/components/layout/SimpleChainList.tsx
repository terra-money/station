import styles from "./SimpleChainList.module.scss"
import classNames from "classnames"
import { useSortedDisplayChains } from "utils/chain"

interface Props {
  list: InterchainNetwork[]
  onClick: (chainID: string) => void
}

const cx = classNames.bind(styles)

const SimpleChainList = ({ list, onClick }: Props) => {
  const activeChains = useSortedDisplayChains()
  return (
    <div className={styles.options}>
      {list.map(({ chainID, name, icon }) => (
        <button
          key={chainID}
          className={cx(styles.button, {
            [styles.active]: activeChains.includes(chainID),
          })}
          onClick={() => onClick(chainID)}
        >
          <img src={icon} alt={name} />
          {name}
        </button>
      ))}
    </div>
  )
}

export default SimpleChainList
