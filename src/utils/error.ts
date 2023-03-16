import axios, { AxiosError } from "axios"

const getErrorMessage = (
  error?: Error | AxiosError | object | unknown
): string | undefined => {
  if (!error) return

  if (axios.isAxiosError(error))
    return (error as AxiosError<any>).response?.data?.message ?? error.message

  if (error instanceof Error) return error.message
}

const isError = (error?: Error | AxiosError | object | unknown): boolean => {
  if (
    !error ||
    (Object.getPrototypeOf(error) === Object.prototype &&
      Object.keys(error as object).length === 0)
  ) {
    return false
  } else {
    return true
  }
}

export { getErrorMessage, isError }
