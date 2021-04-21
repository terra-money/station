import { Auto, Page } from "components/layout"
import Coins from "./Coins"
import Tokens from "./Tokens"
import Rewards from "./Rewards"
import AnchorEarn from "./AnchorEarn"

const Wallet = () => {
  return (
    <Page title="Wallet">
      <Auto
        columns={[
          <>
            <Coins />
            <Tokens />
          </>,
          <>
            <Rewards />
            <AnchorEarn />
          </>,
        ]}
      />
    </Page>
  )
}

export default Wallet
