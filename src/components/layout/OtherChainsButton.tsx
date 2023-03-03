import { useNetwork } from "data/wallet"
import { useState } from "react"
import { useDisplayChains } from "utils/localStorage"
import { SimpleChainList } from "components/layout"
import { useBankBalance } from "data/queries/bank"

const OtherChainsButton = () => {
  const network = useNetwork()
  const { displayChains } = useDisplayChains()
  const [showChainSelector, setShowChainSelector] = useState(false)

  const otherChains = Object.entries(network).filter(
    ([k, v]) => !displayChains.includes(v.chainID)
  )
  const list = otherChains.map((item) => item[1])

  const openDropDown = () => {
    setShowChainSelector(true)
  }
  const openSettings = () => {
    console.log("show settings")
  }

  return (
    <div>
      <button onClick={() => openDropDown()}>+ {otherChains.length}</button>
      {showChainSelector && (
        <SimpleChainList onClick={openSettings} list={list} />
      )}
    </div>
  )
}

export default OtherChainsButton
