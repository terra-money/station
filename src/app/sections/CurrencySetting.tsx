import { useSupportedFiat } from "data/queries/coingecko"
import { useCurrencyState } from "data/settings/Currency"
import { RadioGroup } from "components/form"
import WithSearchInput from "pages/custom/WithSearchInput"

const CurrencySetting = () => {
  const { data: fiatList = [] } = useSupportedFiat()
  const [currency, setCurrency] = useCurrencyState()

  return (
    <WithSearchInput gap={8} small>
      {(input) => (
        <RadioGroup
          options={fiatList
            .filter(
              (fiat) =>
                fiat.name.toLowerCase().includes(input.toLowerCase()) ||
                fiat.id.toLowerCase().includes(input.toLowerCase()) ||
                fiat.symbol.toLowerCase().includes(input.toLowerCase())
            )
            .map((fiat) => {
              return { value: fiat.id, label: `${fiat.symbol} - ${fiat.name}` }
            })}
          value={currency.id}
          onChange={(value) => {
            setCurrency(
              fiatList.find((fiat) => fiat.id === value) as {
                name: string
                symbol: string
                id: string
              }
            )
          }}
        />
      )}
    </WithSearchInput>
  )
}

export default CurrencySetting
