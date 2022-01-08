import { useMinimumValue } from "data/settings/MinimumValue"
import { Select } from "components/form"

const SelectMinimumValue = () => {
  const [value, set, list] = useMinimumValue()

  return (
    <Select value={value} onChange={(e) => set(Number(e.target.value))} small>
      {list.map(({ value, label }) => (
        <option value={value} key={value}>
          {label}
        </option>
      ))}
    </Select>
  )
}

export default SelectMinimumValue
