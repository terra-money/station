import React from "react"
import { render, screen } from "@testing-library/react"
import CurrencySetting from "./CurrencySetting"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"

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
      <RecoilRoot>
        <CurrencySetting />
      </RecoilRoot>
    </NetworksProvider>
  )
}

jest.mock("../../data/queries/coingecko", () => {
  // Retain functionality of other exports.
  const actual = jest.requireActual("../../data/queries/coingecko")

  // Replace functionality of useSupportedFiat.
  const useSupportedFiatMock = () => {
    return {
      data: supportedFiatListMock,
    }
  }

  return {
    ...actual,
    useSupportedFiat: useSupportedFiatMock,
  }
})

// Mocked supported fiats list.
const supportedFiatListMock = [
  {
    id: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
  },
  {
    id: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
  },
  {
    id: "USD",
    name: "United States Dollar",
    symbol: "$",
  },
]

describe("Currency Setting loads", () => {
  it("only currencies in supported fiat list display", () => {
    renderComponent()

    for (let { name, symbol } of supportedFiatListMock) {
      let currencyDisplay = screen.getByText(`${symbol} - ${name}`)
      expect(currencyDisplay).toBeInTheDocument()
    }

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(3)
  })
})
