import React from "react"
import Aside from "../sections/Aside"
import { render } from "@testing-library/react"

function renderComponent() {
  return render(<Aside />)
}

describe("Aside", () => {
  it("matches original component", () => {
    const { asFragment } = renderComponent()
    expect(asFragment()).toMatchSnapshot()
  })
})
