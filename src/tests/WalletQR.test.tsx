import React from "react"
import * as axios from "axios"
import { render, screen } from "@testing-library/react"
import WalletQR from "../app/sections/WalletQR"
import { NetworksProvider } from "app/InitNetworks"
import { RecoilRoot } from "recoil"

// Mock out all top level functions, such as get, put, delete and post:
jest.mock("axios", () => ({
  get: jest.fn((url) => {
    console.error(url)
    if (url === "www.example.com") {
      return Promise.resolve({ data: {} })
    }

    return Promise.resolve({ data: {} })
  }),
}))

jest.mock("@terra-money/use-wallet", () => ({
  useConnectedWallet: () => ({ addresses: { "pheonix-1": "test" } }),
}))

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
describe("WalletQR", () => {
  it("renders WalletQR", () => {
    const networks = {} as jest.Mocked<InterchainNetworks>
    const mockedTokenFilter = (() => ({})) as jest.Mocked<TokenFilter>

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
