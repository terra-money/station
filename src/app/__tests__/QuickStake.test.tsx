import React from "react"
import { useQuery } from "react-query"
import { render, screen } from "@testing-library/react"
import user from "@testing-library/user-event"
import QuickStake from "pages/stake/QuickStake"
import { NetworksProvider } from "app/InitNetworks"
import { MemoryRouter } from "react-router-dom"
import { RecoilRoot } from "recoil"
import { mockNetworks } from "./__mocks__/Networks.mock"
import { mockValidators, mockPriorityVals } from "./__mocks__/Validators.mock"
import { mockDelegations } from "./__mocks__/Delegations.mock"
import { mockBalances } from "./__mocks__/Balances.mock"
import { mockBankBalance } from "./__mocks__/BankBalance.mock"
import { mockWhitelist } from "./__mocks__/Whitelist.mock"
import { mockExchangeRates } from "./__mocks__/ExchangeRates.mock"
import { mockStakingParams } from "./__mocks__/StakingParams.mock"
import { mockTaxRate } from "./__mocks__/TaxRate.mock"
import { mockTaxCap } from "./__mocks__/TaxCap.mock"

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
          <QuickStake />
        </RecoilRoot>
      </MemoryRouter>
    </NetworksProvider>
  )
}

jest.mock("../../data/wallet", () => {
  const mockUseAddress = () => {
    return "terra111111111111111111111111111111111111111"
  }

  const mockUseNetwork = () => {
    return mockNetworks
  }

  const mockUseNetworkName = () => {
    return "testnet"
  }

  const mockUseChainID = () => {
    return "pisco-1"
  }

  return {
    useAddress: mockUseAddress,
    useNetwork: mockUseNetwork,
    useChainID: mockUseChainID,
    useNetworkName: mockUseNetworkName,
  }
})

jest.mock("../../data/queries/staking", () => {
  const mockUseStakingParams = () => mockStakingParams
  const mockUseDelegations = () => mockDelegations
  const mockUseValidators = () => mockValidators
  const mockGetPriorityVals = () => mockPriorityVals
  const mockGetChainUnbondTime = () => 5
  const mockCalcDelegationsTotal = () => 12899999

  return {
    useStakingParams: mockUseStakingParams,
    useDelegations: mockUseDelegations,
    useValidators: mockUseValidators,
    getPriorityVals: mockGetPriorityVals,
    getChainUnbondTime: mockGetChainUnbondTime,
    calcDelegationsTotal: mockCalcDelegationsTotal,
  }
})

jest.mock("../../data/queries/bank", () => {
  const mockUseIsWalletEmpty = () => {
    return false
  }

  const mockUseBankBalance = () => {
    return mockBankBalance
  }

  const mockUseBalances = () => {
    return mockBalances
  }

  return {
    useIsWalletEmpty: mockUseIsWalletEmpty,
    useBankBalance: mockUseBankBalance,
    useBalances: mockUseBalances,
  }
})

jest.mock("../../data/queries/chains", () => {
  const mockUseWhitelist = () => {
    return mockWhitelist
  }

  return {
    useWhitelist: mockUseWhitelist,
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

jest.mock("../../data/queries/treasury", () => {
  const mockUseTaxRate = () => {
    return mockTaxRate
  }

  const mockUseTaxCap = () => {
    return mockTaxCap
  }

  return {
    useTaxRate: mockUseTaxRate,
    useTaxCap: mockUseTaxCap,
  }
})

jest.mock("@terra-money/terra-utils", () => {
  const actual = jest.requireActual("@terra-money/terra-utils")
  const mockTruncate = (value: string) => value

  return {
    ...actual,
    truncate: mockTruncate,
  }
})

jest.mock("react-query", () => ({
  useQuery: jest.fn().mockReturnValue({
    data: Object,
    isLoading: Boolean,
    error: Object,
  }),
}))

describe("QuickStake", async () => {
  beforeEach(() => {
    useQuery.mockReturnValue({
      data: 420829,
      isLoading: false,
      error: null,
    })
  })

  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches user augmented component", async () => {
    const { asFragment } = renderComponent()

    const networksButton = screen.getByRole("button", {
      name: "+ 5",
    })
    await user.click(networksButton)

    expect(asFragment()).toMatchSnapshot()
  })
})
