import { FC } from "react"
import { Auto } from "components/layout"
import SwitchWallet from "../select/SwitchWallet"
import { isWallet } from "auth"

const ConnectedWallet: FC = ({ children }) => {
  return (
    <Auto columns={[children, isWallet.mobile() ? <></> : <SwitchWallet />]} />
  )
}

export default ConnectedWallet
