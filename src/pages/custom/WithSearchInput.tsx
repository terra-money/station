import { ReactNode, useState } from "react"
import { Grid } from "components/layout"
import { SearchInput } from "components/form"

interface Props {
  children: (input: string) => ReactNode
}

const WithSearchInput = ({ children }: Props) => {
  const [input, setInput] = useState("")

  return (
    <Grid gap={20}>
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
