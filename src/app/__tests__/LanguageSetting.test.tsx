import React from "react"
import { render, screen } from "@testing-library/react"
import LanguageSetting from "../sections/LanguageSetting"
import { NetworksProvider } from "app/InitNetworks"
import user from "@testing-library/user-event"

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
      <LanguageSetting />
    </NetworksProvider>
  )
}

describe("LanguageSetting", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })

  it("matches user augmented component", async () => {
    const { asFragment } = renderComponent()

    // Change language to Chinese.
    const chineseLanguage = screen.getByRole("button", {
      name: "中文",
    })
    await user.click(chineseLanguage)

    // Ensure snapshot matches user augmented component.
    expect(asFragment()).toMatchSnapshot()
  })
})
