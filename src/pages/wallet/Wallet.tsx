import { Auto, Page } from "components/layout"
import Coins from "./Coins"
import Tokens from "./Tokens"
import Vesting from "./Vesting"
import Rewards from "./Rewards"
import LinkEcosystem from "./LinkEcosystem"

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
            <LinkEcosystem />
          </>,
        ]}
      />
    </Page>
  )
}

export default Wallet
