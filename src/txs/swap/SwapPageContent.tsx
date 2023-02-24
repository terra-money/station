import { ConditionalRender } from "components/ConditionalRender"
import { Card, ChainFilter } from "components/layout"
import { RangoSwapForm } from "./RangoSwapForm"
import { useSwapChains } from "./SwapChainsContext"
import TFMSwapContext from "../TFMSwapContext"
import LegacyTFMSwapForm from "./LegacyTFMSwapForm"
import { CurrentChainProvider } from "./CurrentChainProvider"
import { CurrentChainTokensContext } from "./CurrentChainTokensContext"
import { TFMSwapForm } from "./TFMSwapForm"
import { useInterchainAddresses } from "auth/hooks/useAddress"

export const SwapPageContent = () => {
  const { swapProvider } = useSwapChains()

  const addr = useInterchainAddresses()
  console.log(addr)

  return (
    <Card>
      <ChainFilter
        outside
        title={"Select a chain to perform swaps on"}
        limitTo={Object.keys(swapProvider)}
      >
        {(chainID) =>
          chainID && (
            <CurrentChainProvider value={chainID}>
              <ConditionalRender
                value={swapProvider[chainID]}
                legacyTfm={() => (
                  <TFMSwapContext>
                    <LegacyTFMSwapForm />
                  </TFMSwapContext>
                )}
                rango={() => (
                  <CurrentChainTokensContext key={chainID}>
                    <RangoSwapForm />
                  </CurrentChainTokensContext>
                )}
                tfm={() => <TFMSwapForm />}
              />
            </CurrentChainProvider>
          )
        }
      </ChainFilter>
    </Card>
  )
}
