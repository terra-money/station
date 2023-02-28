import { ConditionalRender } from "components/ConditionalRender"
import { Card, ChainFilter } from "components/layout"
import { RangoSwapForm } from "./RangoSwapForm"
import { CurrentChainProvider } from "./CurrentChainProvider"
import {
  RangoCurrentChainTokensProvider,
  TFMCurrentChainTokensProvider,
} from "./CurrentChainTokensProvider"
import { TFMSwapForm } from "./TFMSwapForm"
import { useSwapProviders } from "./SwapProvidersContext"

export const SwapPageContent = () => {
  const { providers } = useSwapProviders()

  return (
    <Card>
      <ChainFilter
        outside
        title={"Select a chain to perform swaps on"}
        limitTo={Object.keys(providers)}
      >
        {(chainID) =>
          chainID && (
            <CurrentChainProvider value={chainID}>
              <ConditionalRender
                value={providers[chainID][0]}
                rango={() => (
                  <RangoCurrentChainTokensProvider key={chainID}>
                    <RangoSwapForm />
                  </RangoCurrentChainTokensProvider>
                )}
                tfm={() => (
                  <TFMCurrentChainTokensProvider key={chainID}>
                    <TFMSwapForm />
                  </TFMCurrentChainTokensProvider>
                )}
              />
            </CurrentChainProvider>
          )
        }
      </ChainFilter>
    </Card>
  )
}
