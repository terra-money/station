import { Auto, Page } from "components/layout"
import Coins from "../../pages/wallet/Coins"
import Tokens from "../../pages/wallet/Tokens"

const SelectSend = () => {
  return (
    <Page>
      <Auto columns={[<Coins />, <Tokens />]} />
    </Page>
  )
}

export default SelectSend
