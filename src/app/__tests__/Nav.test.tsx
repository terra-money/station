import React from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { RecoilRoot } from "recoil"
import Nav from "app/sections/Nav"

function renderComponent() {
  return render(
    <MemoryRouter>
      <RecoilRoot>
        <Nav />
      </RecoilRoot>
    </MemoryRouter>
  )
}

jest.mock("lottie-react", () => ({
  Lottie: jest.fn(),
}))

jest.mock("../../data/settings/Theme", () => {
  const mockUseThemeFavicon = () => "/static/media/favicon.1e08d51d.svg"

  return {
    useThemeFavicon: mockUseThemeFavicon,
  }
})

describe("Nav component matches snapshots", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
