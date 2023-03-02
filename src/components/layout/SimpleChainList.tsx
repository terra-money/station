import styles from "./SimpleChainList.module.scss"

interface Props {
  list: InterchainNetwork[]
  onClick: () => void
}

const SimpleChainList = ({ list, onClick }: Props) => {
  return (
    <div className={styles.container}>
      {list.map(({ chainID, name, icon }) => (
        <button key={chainID} onClick={onClick}>
          <img src={icon} alt={name} />
          {name}
        </button>
      ))}
    </div>
  )
}

export default SimpleChainList
