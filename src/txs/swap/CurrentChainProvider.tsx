import getValueProviderSetup from "utils/getValueProviderSetup"

export const { useValue: useCurrentChain, provider: CurrentChainProvider } =
  getValueProviderSetup<string>("currentChain")
