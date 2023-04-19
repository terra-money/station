import axios, { AxiosError } from "axios"

export const getErrorMessage = (
  error?: Error | AxiosError | object | unknown
): string | undefined => {
  if (
    !error ||
    (Object.getPrototypeOf(error) === Object.prototype &&
      Object.keys(error as object).length === 0)
  )
    return

  if (axios.isAxiosError(error))
    return (error as AxiosError<any>).response?.data?.message ?? error.message

  if (error instanceof Error) return error.message
}
