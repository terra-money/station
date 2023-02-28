import React from "react"
import { render, screen } from "@testing-library/react"
import LanguageSetting from "../app/sections/LanguageSetting"

describe("LanguageSetting", () => {
  it("renders Language Selection", () => {
    render(<LanguageSetting />)
    expect(screen.getByText("Deutsch")).toBeInTheDocument()
    expect(screen.getByText("Français")).toBeInTheDocument()
  })
})
