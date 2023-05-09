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

describe("Nav", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
