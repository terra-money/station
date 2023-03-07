import { useState } from "react"
import { SimpleChainList } from "components/layout"
import { Button } from "components/general"
import { Popover } from "components/display"
import { PopoverNone } from "app/components"
import styles from "./OtherChainsButton.module.scss"
import { useDisplayChains } from "utils/localStorage"

type Props = {
  list: InterchainNetwork[]
}

const OtherChainsButton = ({ list }: Props) => {
  const [key, setKey] = useState(0)
  const { insertDisplayChain } = useDisplayChains()
  const closePopover = () => setKey((key) => key + 1)

  const onClick = (chainID: string) => {
    insertDisplayChain(chainID)

    closePopover()
  }

  return (
    <Popover
      className={styles.popover}
      theme="none"
      maxWidth={200}
      key={key}
      content={<SimpleChainList onClick={onClick} list={list} />}
    >
      <button className={styles.button}>+ {list.length}</button>
    </Popover>
  )
}

export default OtherChainsButton
