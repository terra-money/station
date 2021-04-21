import React, { useContext } from "react"

const createContext = <A>(name: string) => {
  const ctx = React.createContext<A | undefined>(undefined)

  const useCtx = () => {
    const c = useContext(ctx)
    if (!c) throw new Error(`${name} must be inside a provider with a value`)
    return c
  }

  return [useCtx, ctx.Provider] as const
}

export default createContext
