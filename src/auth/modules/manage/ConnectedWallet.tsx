import { FC } from "react"
import { Auto } from "components/layout"
import SwitchWallet from "../select/SwitchWallet"

const ConnectedWallet: FC = ({ children }) => {
  return <Auto columns={[children, <SwitchWallet />]} />
}

export default ConnectedWallet
