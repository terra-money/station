import axios, { AxiosError } from "axios"

export const getErrorMessage = (
  error?: Error | AxiosError | unknown
): string | undefined => {
  if (error) return

  if (axios.isAxiosError(error))
    return (error as AxiosError<any>).response?.data?.message ?? error.message

  if (error instanceof Error) return error.message
}

export const isError = (error?: Error | AxiosError | unknown): boolean => {
  if (
    !error ||
    (Object.getPrototypeOf(error) === Object.prototype &&
      Object.keys(error).length === 0)
  ) {
    return false
  } else {
    return true
  }
}
