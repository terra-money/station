import React from "react"
import { render, screen } from "@testing-library/react"
import WalletQR from "../app/sections/WalletQR"
import { NetworksProvider } from "app/InitNetworks"
import { BRIDGE } from "config/constants"
import { RecoilRoot } from "recoil"

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
describe("WalletQR", () => {
  it("renders WalletQR", () => {
    const networks = {} as jest.Mocked<InterchainNetworks>
    const mockedTokenFilter = {} as jest.Mocked<TokenFilter>

    render(
      <NetworksProvider
        value={{
          networks: networks,
          filterEnabledNetworks: mockedTokenFilter,
          filterDisabledNetworks: mockedTokenFilter,
        }}
      >
        <RecoilRoot>
          <WalletQR renderButton={(open) => <p>test</p>} />
        </RecoilRoot>
      </NetworksProvider>
    )
    // expect(screen.getByRole('button')).toBeInTheDocument();
  })
})
