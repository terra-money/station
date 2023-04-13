export const mockDelegation = {
  status: "success",
  isLoading: false,
  isSuccess: true,
  isError: false,
  isIdle: false,
  data: {
    balance: { amount: "1000000", denom: "uluna" },
    delegation: {
      delegator_address: "terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp",
      shares: "1001001.000998567381174912",
      validator_address: "terravaloper1fzx6z3qlwjyjjt3e5q6sakvt74n08uq9alzae3",
    },
  },
  dataUpdatedAt: 1681243129107,
  error: null,
  errorUpdatedAt: 0,
  failureCount: 0,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isRefetching: false,
  isLoadingError: false,
  isPlaceholderData: false,
  isPreviousData: false,
  isRefetchError: false,
  isStale: true,
}

export const mockDelegations = [
  '{"balance":{"amount":"99900000","denom":"uluna"},"delegation":{"delegator_address":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp","shares":"100000000.000000000000000000","validator_address":"terravaloper1gtw2uxdkdt3tvq790ckjz8jm8qgwkdw3uptstn"}}',
  '{"balance":{"amount":"1000000","denom":"uluna"},"delegation":{"delegator_address":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp","shares":"1001001.000998567381174912","validator_address":"terravaloper1fzx6z3qlwjyjjt3e5q6sakvt74n08uq9alzae3"}}',
  '{"balance":{"amount":"1999999","denom":"uluna"},"delegation":{"delegator_address":"terra18j6kg55a960v0l845mxeg6k0r8vfux5tsexdkp","shares":"2014056.144428574801417257","validator_address":"terravaloper175c8svlwgrauw729pgsfz7efkp5fuhaw26gaef"}}',
]
