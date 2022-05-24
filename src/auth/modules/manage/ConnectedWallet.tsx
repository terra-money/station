import { PropsWithChildren } from "react"
import { Auto } from "components/layout"
import SwitchWallet from "../select/SwitchWallet"

const ConnectedWallet = ({ children }: PropsWithChildren<{}>) => {
  return <Auto columns={[children, <SwitchWallet />]} />
}

export default ConnectedWallet
