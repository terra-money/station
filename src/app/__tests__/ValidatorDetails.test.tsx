import React from "react"
import ValidatorDetails from "pages/stake/ValidatorDetails"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import { render } from "@testing-library/react"
import { mockNetworks } from "./__mocks__/Networks.mock"
import { mockValidatorDetails } from "./__mocks__/ValidatorDetails.mock"
import { MemoryRouter } from "react-router-dom"
import { mockDelegation, mockDelegations } from "./__mocks__/Delegations.mock"
import { mockRewards } from "./__mocks__/Rewards.mock"
import { mockExchangeRates } from "./__mocks__/ExchangeRates.mock"
import { mockWhitelist } from "./__mocks__/Whitelist.mock"

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
          <ValidatorDetails />
        </RecoilRoot>
      </MemoryRouter>
    </NetworksProvider>
  )
}

jest.mock("lottie-react", () => ({
  Lottie: jest.fn(),
}))

jest.mock("../../pages/stake/useAddressParams", () => ({
  __esModule: true,
  default: () => "terravaloper1fzx6z3qlwjyjjt3e5q6sakvt74n08uq9alzae3",
}))

jest.mock("../../data/wallet", () => {
  const mockUseNetwork = () => {
    return mockNetworks
  }

  const mockUseNetworkName = () => {
    return "testnet"
  }

  return {
    useNetwork: mockUseNetwork,
    useNetworkName: mockUseNetworkName,
  }
})

jest.mock("../../data/queries/staking", () => {
  const mockUseValidator = () => mockValidatorDetails
  const mockUseDelegation = () => mockDelegation
  const mockUseDelegations = () => mockDelegations

  return {
    useValidator: mockUseValidator,
    useDelegation: mockUseDelegation,
    useDelegations: mockUseDelegations,
  }
})

jest.mock("../../data/settings/Theme", () => {
  const mockUseThemeFavicon = () => "/static/media/favicon.1e08d51d.svg"

  return {
    useThemeFavicon: mockUseThemeFavicon,
  }
})

jest.mock("../../data/queries/distribution", () => {
  const mockUseRewards = () => {
    return mockRewards
  }

  return {
    useRewards: mockUseRewards,
  }
})

jest.mock("../../data/queries/coingecko", () => {
  const mockUseExchangeRates = () => {
    return mockExchangeRates
  }

  const mockUseMemoizedCalcValue = () => {
    return (
      ({ amount, denom }) => {
        return Number(amount) * Number(mockExchangeRates[denom] ?? 0)
      },
      [mockExchangeRates]
    )
  }

  return {
    useExchangeRates: mockUseExchangeRates,
    useMemoizedCalcValue: mockUseMemoizedCalcValue,
  }
})

jest.mock("../../data/queries/chains", () => {
  const actual = jest.requireActual("../../data/queries/chains")

  const mockUseWhitelist = () => {
    return mockWhitelist
  }

  return {
    ...actual,
    useWhitelist: mockUseWhitelist,
  }
})

describe("ValidatorDetails", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
