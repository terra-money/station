import { PropsWithChildren } from "react"
import { Auto } from "components/layout"
import SwitchWallet from "../select/SwitchWallet"
import { isWallet } from "auth"

const ConnectedWallet = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Auto columns={[children, isWallet.mobile() ? <></> : <SwitchWallet />]} />
  )
}

export default ConnectedWallet
