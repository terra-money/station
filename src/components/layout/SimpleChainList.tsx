import styles from "./SimpleChainList.module.scss"
import classNames from "classnames"
import { InterchainNetwork } from "types/network"
import { useDisplayChains } from "utils/localStorage"

interface Props {
  list: InterchainNetwork[]
  onClick: (chainID: string) => void
}

const cx = classNames.bind(styles)

const SimpleChainList = ({ list, onClick }: Props) => {
  const { displayChains } = useDisplayChains()
  const sortedList = list.sort((a, b) =>
    displayChains?.includes(a?.chainID) && !displayChains?.includes(b?.chainID)
      ? -1
      : !displayChains?.includes(a?.chainID) &&
        displayChains?.includes(b?.chainID)
      ? 1
      : 0
  )

  return (
    <div className={styles.options}>
      {sortedList.map(({ chainID, name, icon }) => (
        <button
          key={chainID}
          className={cx(styles.button, {
            [styles.active]: displayChains?.includes(chainID),
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
