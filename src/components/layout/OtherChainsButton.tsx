import { useState } from "react"
import { SimpleChainList } from "components/layout"
import { Popover } from "components/display"
import styles from "./OtherChainsButton.module.scss"
import { useSelectedDisplayChain } from "utils/localStorage"
import { displayChainPrefsOpen } from "app/sections/Preferences"
import { useSetRecoilState } from "recoil"
import { useDisplayChains } from "utils/localStorage"
import { InterchainNetwork } from "types/network"

type Props = {
  list: InterchainNetwork[]
  handleSetChain: (chainID: string) => void
}

const OtherChainsButton = ({ list, handleSetChain }: Props) => {
  const [key, setKey] = useState(0)
  const setIsOpen = useSetRecoilState(displayChainPrefsOpen)
  const { changeSelectedDisplayChain } = useSelectedDisplayChain()
  const { displayChains } = useDisplayChains()

  const closePopover = () => setKey((key) => key + 1)

  const onClick = (chainID: string) => {
    if (displayChains?.includes(chainID)) {
      changeSelectedDisplayChain(chainID)
      handleSetChain(chainID)
    } else {
      setIsOpen(true)
    }
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
      {list.length ? (
        <button className={styles.button}>+ {list.length}</button>
      ) : undefined}
    </Popover>
  )
}

export default OtherChainsButton
