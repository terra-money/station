import { ReactNode, useState } from "react"
import { Grid } from "components/layout"
import { SearchInput } from "components/form"

interface Props {
  gap?: number
  placeholder?: string
  inline?: boolean
  padding?: boolean
  small?: boolean
  disabled?: boolean
  children: (input: string) => ReactNode
}

const WithSearchInput = ({
  gap,
  children,
  placeholder,
  padding,
  small,
  inline,
  disabled,
}: Props) => {
  const [input, setInput] = useState("")
  if (disabled) return <>{children("")}</>

  return (
    <Grid gap={gap ?? 20}>
      <SearchInput
        value={input}
        small={small}
        inline={inline}
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
