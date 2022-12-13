import { ReactNode, useState } from "react"
import { Grid } from "components/layout"
import { SearchInput } from "components/form"

interface Props {
  gap?: number
  children: (input: string) => ReactNode
}

const WithSearchInput = ({ gap, children }: Props) => {
  const [input, setInput] = useState("")

  return (
    <Grid gap={gap ?? 20}>
      <SearchInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      {children(input)}
    </Grid>
  )
}

export default WithSearchInput
