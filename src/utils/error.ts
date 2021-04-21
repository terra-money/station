import axios, { AxiosError } from "axios"

export const getErrorMessage = (
  error?: Error | AxiosError | unknown
): string | undefined => {
  if (!error) return

  if (axios.isAxiosError(error))
    return error.response?.data.message ?? error.message

  if (error instanceof Error) return error.message
}
