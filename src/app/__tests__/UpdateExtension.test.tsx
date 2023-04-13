import React from "react"
import { render } from "@testing-library/react"
import UpdateExtension from "../sections/UpdateExtension"

describe("UpdateExtension component", () => {
  beforeEach(() => {
    window.isTerraExtensionAvailable = true
    window.isStationExtensionAvailable = false
  })
  it("should match snapshot when Terra extension is available and Station extension is not available", () => {
    const { asFragment } = render(<UpdateExtension />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("should match snapshot when Terra extension is not available and Station extension is not available", () => {
    window.isTerraExtensionAvailable = false

    const { asFragment } = render(<UpdateExtension />)

    expect(asFragment()).toMatchSnapshot()
  })

  it("should match snapshot when Terra extension is not available and Station extension is available", () => {
    window.isTerraExtensionAvailable = false
    window.isStationExtensionAvailable = true

    const { asFragment } = render(<UpdateExtension />)

    expect(asFragment()).toMatchSnapshot()
  })
})
