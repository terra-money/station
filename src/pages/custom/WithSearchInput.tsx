/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-09 17:04:45
 * @LastEditors: lmk
 * @Description:
 */
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
      <p style={{ fontSize: 16, fontWeight: "600" }}>
        Choose a validator to Delegate your stake
      </p>
      <SearchInput value={input} onChange={(e) => setInput(e.target.value)} />
      {children(input)}
    </Grid>
  )
}

export default WithSearchInput
