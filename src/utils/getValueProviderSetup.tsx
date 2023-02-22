import { createContext, PropsWithChildren } from "react"
import capitalizeFirstLetter from "./capitalizeFirstLetter"
import createContextHook from "./createContextHook"

function getValueProviderSetup<T>(name: string) {
  const ValueContext = createContext<T | undefined>(undefined)

  type Props = PropsWithChildren<{ value: T }>

  const ValueProvider = ({ children, value }: Props) => {
    return (
      <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
    )
  }

  return {
    provider: ValueProvider,
    useValue: createContextHook(
      ValueContext,
      `${capitalizeFirstLetter(name)}Context`
    ),
  }
}

export default getValueProviderSetup
