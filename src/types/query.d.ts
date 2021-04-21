interface QueryState {
  isIdle?: boolean
  isLoading?: boolean
  isFetching?: boolean
  isSuccess?: boolean
  error?: Error | unknown
}
