import axios, { AxiosError } from "axios"

export const getErrorMessage = (
  error?: Error | AxiosError | object | unknown
): string | undefined => {
  if (!isError(error)) return

  if (axios.isAxiosError(error))
    return (error as AxiosError<any>).response?.data?.message ?? error.message

  if (error instanceof Error) return error.message
}

export const isError = (
  error?: Error | AxiosError | object | unknown
): boolean => {
  if (!error || JSON.stringify(error) === "{}") {
    return false
  } else {
    return true
  }
}
