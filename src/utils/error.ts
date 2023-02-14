import axios, { AxiosError } from "axios"

export const getErrorMessage = (
  error?: Error | AxiosError | unknown
): string | undefined => {
  if (!error) return

  if (axios.isAxiosError(error))
    return (error as AxiosError<any>).response?.data?.message ?? error.message

  if (error instanceof Error && process.env.NODE_ENV === "development")
    return error.message

  return "Something went wrong, reload the page and try again"
}
