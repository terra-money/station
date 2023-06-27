import WithSearchInput from "pages/custom/WithSearchInput"
import { useDisplayChains, useSelectedDisplayChain } from "utils/localStorage"
import SettingsSelectorToggle from "components/layout/SettingsSelectorToggle"
import { useNetwork } from "data/wallet"
import { ChainButton } from "components/general"

import { isTerraChain } from "utils/chain"

const DisplayChainsSetting = () => {
  const { displayChains, changeDisplayChains } = useDisplayChains()
  const { selectedDisplayChain, changeSelectedDisplayChain } =
    useSelectedDisplayChain()
  const network = useNetwork()

  const onChange = (value: string) => {
    if (isTerraChain(value)) return
    const newDisplayChains = displayChains?.includes(value)
      ? displayChains?.filter((chainID) => chainID !== value)
      : [...(displayChains || []), value]
    changeDisplayChains(newDisplayChains)
    if (value === selectedDisplayChain) {
      changeSelectedDisplayChain(undefined)
    }
  }

  return (
    <WithSearchInput
      placeholder="Search for chains..."
      extra={<ChainButton />}
      gap={8}
    >
      {(input) => (
        <SettingsSelectorToggle
          onChange={onChange}
          options={Object.keys(network ?? {})
            .filter(
              (chainID) =>
                network[chainID].name
                  .toLowerCase()
                  .includes(input.toLowerCase()) ||
                chainID.toLowerCase().includes(input.toLowerCase())
            )
            .map((chainID) => ({
              value: chainID,
              selected: displayChains?.includes(chainID),
              label: network[chainID].name,
              icon: network[chainID].icon,
            }))
            .sort((a, b) => {
              if (isTerraChain(a.value) !== isTerraChain(b.value))
                return isTerraChain(a.value) ? -1 : 1
              if (a.selected !== b.selected) return a.selected ? -1 : 1
              return 0
            })}
        />
      )}
    </WithSearchInput>
  )
}

export default DisplayChainsSetting
