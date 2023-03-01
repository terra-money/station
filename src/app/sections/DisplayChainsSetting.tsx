import WithSearchInput from "pages/custom/WithSearchInput"
import { useDisplayChains } from "utils/localStorage"
import SettingsSelectorToggle from "components/form/SettingsSelectorToggle"
import { useNetwork } from "data/wallet"

const DisplayChainsSetting = () => {
  const { displayChains, changeDisplayChains } = useDisplayChains()
  const network = useNetwork()

  const onChange = (value: string) => {
    const newDisplayChains = displayChains.includes(value)
      ? displayChains.filter((chainID) => chainID !== value)
      : [...displayChains, value]
    changeDisplayChains(newDisplayChains)
  }

  return (
    <WithSearchInput gap={8}>
      {(input) => (
        <SettingsSelectorToggle
          onChange={onChange}
          options={Object.keys(network)
            .filter(
              (chainID) =>
                network[chainID].name
                  .toLowerCase()
                  .includes(input.toLowerCase()) ||
                chainID.toLowerCase().includes(input.toLowerCase())
            )
            .map((chainID) => ({
              value: chainID,
              selected: displayChains.includes(chainID),
              label: network[chainID].name,
            }))}
        />
      )}
    </WithSearchInput>
  )
}

export default DisplayChainsSetting
