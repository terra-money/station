import { useState } from "react"
import { SimpleChainList } from "components/layout"

type Props = {
  list: InterchainNetwork[]
}

const OtherChainsButton = ({ list }: Props) => {
  const [showChainSelector, setShowChainSelector] = useState(false)

  const openDropDown = () => {
    setShowChainSelector(true)
  }
  const openSettings = () => {
    console.log("show settings")
  }

  return (
    <div>
      <button onClick={() => openDropDown()}>+ {list.length}</button>
      {showChainSelector && (
        <SimpleChainList onClick={openSettings} list={list} />
      )}
    </div>
  )
}

export default OtherChainsButton
