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
  extra?: ReactNode
  children: (input: string) => ReactNode
  className?: string
}

const WithSearchInput = ({
  gap,
  children,
  placeholder,
  padding,
  small,
  inline,
  extra,
  className,
}: Props) => {
  const [input, setInput] = useState("")

  return (
    <Grid gap={gap ?? 20} className={className}>
      <SearchInput
        value={input}
        small={small}
        inline={inline}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
        extra={extra}
        padding={padding}
      />
      {children(input)}
    </Grid>
  )
}

export default WithSearchInput
