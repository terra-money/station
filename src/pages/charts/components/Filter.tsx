import { PropsWithChildren } from "react"
import { Flex } from "components/layout"

const Filter = ({ children }: PropsWithChildren<{}>) => {
  return <Flex gap={8}>{children}</Flex>
}

export default Filter
