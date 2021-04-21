import { FC } from "react"
import { Flex } from "components/layout"

const Filter: FC = ({ children }) => {
  return <Flex gap={8}>{children}</Flex>
}

export default Filter
