import { ConditionalRender } from "components/ConditionalRender"
import { Card, ChainFilter } from "components/layout"
import { RangoSwapForm } from "./RangoSwapForm"
import { useSwapChains } from "./SwapChainsContext"
import TFMSwapContext from "../TFMSwapContext"
import TFMSwapForm from "./TFMSwapForm"
import { CurrentChainProvider } from "./CurrentChainProvider"
import { CurrentChainTokensContext } from "./CurrentChainTokensContext"

export const SwapPageContent = () => {
  const { swapProvider } = useSwapChains()

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
                tfm={() => (
                  <TFMSwapContext>
                    <TFMSwapForm />
                  </TFMSwapContext>
                )}
                rango={() => (
                  <CurrentChainTokensContext key={chainID}>
                    <RangoSwapForm />
                  </CurrentChainTokensContext>
                )}
              />
            </CurrentChainProvider>
          )
        }
      </ChainFilter>
    </Card>
  )
}
