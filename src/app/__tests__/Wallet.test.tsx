import React from "react"
import { render } from "@testing-library/react"
import { RecoilRoot } from "recoil"
import { MemoryRouter } from "react-router-dom"
import Wallet from "pages/wallet/Wallet"
import { NetworksProvider } from "../InitNetworks"
import { mockExchangeRates } from "./__mocks__/ExchangeRates.mock"
import { mockNetworks } from "./__mocks__/Networks.mock"

function renderComponent() {
  type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
  const networks = {} as jest.Mocked<InterchainNetworks>
  const mockedTokenFilter = {} as jest.Mocked<TokenFilter>

  return render(
    <NetworksProvider
      value={{
        networks: networks,
        filterEnabledNetworks: mockedTokenFilter,
        filterDisabledNetworks: mockedTokenFilter,
      }}
    >
      <MemoryRouter>
        <RecoilRoot>
          <Wallet />
        </RecoilRoot>
      </MemoryRouter>
    </NetworksProvider>
  )
}

const mockCoins = [
  {
    denom:
      "ibc/BE2E170E02D101A1DC61255C51533FED2B6163FD2757DA11494FEB6D65ABEFC4",
    amount: "1000000000",
    chain: "pisco-1",
  },
  {
    denom: "uluna",
    amount: "1092273346",
    chain: "pisco-1",
  },
]

jest.mock("../../data/queries/bank", () => {
  const mockUseIsWalletEmpty = () => {
    return false
  }

  const mockUseBankBalance = () => {
    return mockCoins
  }

  return {
    useIsWalletEmpty: mockUseIsWalletEmpty,
    useBankBalance: mockUseBankBalance,
  }
})

jest.mock("../../data/wallet", () => {
  const mockUseNetworkName = () => {
    return "testnet"
  }

  const mockUseNetwork = () => {
    return mockNetworks
  }

  return {
    useNetworkName: mockUseNetworkName,
    useNetwork: mockUseNetwork,
  }
})

jest.mock("../../data/queries/coingecko", () => {
  const mockUseExchangeRates = () => {
    return mockExchangeRates
  }

  return {
    useExchangeRates: mockUseExchangeRates,
  }
})

jest.mock("../../data/token", () => {
  const actual = jest.requireActual("../../data/token")

  const mockUseNativeDenoms = () => {
    return () => {
      return { token: "uluna", decimals: 6, symbol: "LUNA" }
    }
  }

  return {
    ...actual,
    useNativeDenoms: mockUseNativeDenoms,
  }
})

describe("Wallet", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
