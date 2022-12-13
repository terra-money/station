import { ReactNode, useState } from "react"
import { Grid } from "components/layout"
import { SearchInput } from "components/form"

interface Props {
  gap?: number
  placeholder?: string
  padding?: boolean
  children: (input: string) => ReactNode
}

const WithSearchInput = ({ gap, children, placeholder, padding }: Props) => {
  const [input, setInput] = useState("")

  return (
    <Grid gap={gap ?? 20}>
      <SearchInput
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
        padding={padding}
      />
      {children(input)}
    </Grid>
  )
}

export default WithSearchInput
