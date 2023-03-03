import React from "react"
import { render, screen } from "@testing-library/react"
import LanguageSetting from "./LanguageSetting"
import { NetworksProvider } from "app/InitNetworks"

type TokenFilter = <T>(network: Record<string, T>) => Record<string, T>
describe("LanguageSetting", () => {
  it("render((s Language Selection", () => {
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
        <LanguageSetting />
      </NetworksProvider>
    )
    expect(screen.getByText("Deutsch")).toBeInTheDocument()
    expect(screen.getByText("Français")).toBeInTheDocument()
  })
})
