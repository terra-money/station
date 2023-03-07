import React from "react"
import { render, screen } from "@testing-library/react"
import CurrencySetting from "./CurrencySetting"
import { RecoilRoot } from "recoil"
import { NetworksProvider } from "../InitNetworks"
import renderer from "react-test-renderer"
import user from "@testing-library/user-event"

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
const networks = {} as jest.Mocked<InterchainNetworks>
const mockedTokenFilter = {} as jest.Mocked<TokenFilter>

function renderComponent() {
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

    // Ensure all currencies in supported fiat list are displayed.
    for (let { name, symbol } of supportedFiatListMock) {
      let currencyDisplay = screen.getByText(`${symbol} - ${name}`)
      expect(currencyDisplay).toBeInTheDocument()
    }

    // Ensure only supported fiat list currencies are on display.
    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(3)
  })

  // Ensure snapshot matches original component.
  it("matches snapshot", () => {
    const tree = renderer
      .create(
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
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})

describe("User can change currencies", () => {
  it("allows user to change currencies", async () => {
    const { asFragment } = renderComponent()

    // Search for JPY currency in search bar.
    const searchBar = screen.getByRole("textbox")
    await user.click(searchBar)
    await user.keyboard("JPY")

    // Ensure only JPY button shows and click to change currency.
    const jpyButton = screen.getByRole("button")
    await user.click(jpyButton)

    // Ensure snapshot matches user augmented component.
    expect(asFragment()).toMatchSnapshot()
  })
})
