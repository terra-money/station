import React from "react"
import { render } from "@testing-library/react"
import { RecoilRoot } from "recoil"
import { MemoryRouter } from "react-router-dom"
import Wallet from "pages/wallet/Wallet"
import { NetworksProvider } from "../InitNetworks"
import { mockExchangeRates } from "../../__mocks__/ExchangeRates.mock"
import { mockNetworks } from "../../__mocks__/Networks.mock"
import { mockBankBalance } from "../../__mocks__/BankBalance.mock"

function renderComponent() {
  type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
  const networks = {} as jest.Mocked<InterchainNetworks>
  const mockedTokenFilter = jest.fn() as jest.Mocked<TokenFilter>

  return render(
    <NetworksProvider
      value={{
        networksLoading: false,
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

jest.mock("../../data/queries/bank", () => {
  const mockUseIsWalletEmpty = () => {
    return false
  }

  const mockUseBankBalance = () => {
    return mockBankBalance
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
