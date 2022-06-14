import { PropsWithChildren } from "react"
import { Flex } from "components/layout"
import { isWallet } from "auth"

const Filter = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Flex gap={8} start={isWallet.mobile()}>
      {children}
    </Flex>
  )
}

export default Filter
