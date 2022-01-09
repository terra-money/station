import { useIsAnchorAvailable } from "data/external/anchor"
import { Auto, Page } from "components/layout"
import Coins from "./Coins"
import Tokens from "./Tokens"
import Rewards from "./Rewards"
import AnchorEarn from "./AnchorEarn"

const Wallet = () => {
  const isAnchorAvailable = useIsAnchorAvailable()

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
            {isAnchorAvailable && <AnchorEarn />}
          </>,
        ]}
      />
    </Page>
  )
}

export default Wallet
