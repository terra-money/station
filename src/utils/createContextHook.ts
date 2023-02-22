import { Context as ReactContext, useContext } from "react"

function createContextHook<T>(
  Context: ReactContext<T | undefined>,
  contextName: string
) {
  return () => {
    const context = useContext(Context)

    if (!context) {
      throw new Error(`${contextName} is not provided`)
    }

    return context
  }
}

export default createContextHook
