import { useState } from "react"
import { SimpleChainList } from "components/layout"
import { Popover } from "components/display"
import styles from "./OtherChainsButton.module.scss"
import { useSelectedDisplayChain } from "utils/localStorage"

type Props = {
  list: InterchainNetwork[]
  handleSetChain: (chainID: string) => void
}

const OtherChainsButton = ({ list, handleSetChain }: Props) => {
  const [key, setKey] = useState(0)
  const { changeSelectedDisplayChain } = useSelectedDisplayChain()
  const closePopover = () => setKey((key) => key + 1)

  const onClick = (chainID: string) => {
    changeSelectedDisplayChain(chainID)
    handleSetChain(chainID)
    closePopover()
  }

  return (
    <Popover
      className={styles.popover}
      theme="none"
      maxWidth={200}
      key={key}
      placement="bottom"
      content={<SimpleChainList onClick={onClick} list={list} />}
    >
      <button className={styles.button}>+ {list.length}</button>
    </Popover>
  )
}

export default OtherChainsButton
