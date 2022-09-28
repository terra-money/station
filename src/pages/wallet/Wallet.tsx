import { Auto, Page } from "components/layout"
import Coins from "./Coins"
import Tokens from "./Tokens"
import Vesting from "./Vesting"
import Rewards from "./Rewards"

const Wallet = () => {
  return (
    <Page title="Wallet">
      <Auto
        columns={[
          <>
            <Coins />
            <Tokens />
            <Vesting />
          </>,
          <>
            <Rewards />
          </>,
        ]}
      />
    </Page>
  )
}

export default Wallet
