import { Component, PropsWithChildren, ReactNode } from "react"
import { AxiosError } from "axios"
import { getErrorMessage } from "utils/error"
import Wrong from "./Wrong"
import Forbidden from "./Forbidden"

interface Props {
  fallback?: (error: Error) => ReactNode
}

export interface State {
  error: AxiosError | Error | null
}

const initialState = { error: null } as State

class ErrorBoundary extends Component<PropsWithChildren<Props>, State> {
  state = initialState

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    const { fallback, children } = this.props
    const { error } = this.state

    return !error ? (
      children
    ) : getIsForbidden(error) ? (
      <Forbidden />
    ) : (
      fallback?.(error) ?? <Wrong>{getErrorMessage(error)}</Wrong>
    )
  }
}

export default ErrorBoundary

/* helpers */
const getIsForbidden = (error: AxiosError | Error) => {
  if ("response" in error) return error.response?.status === 403
}
