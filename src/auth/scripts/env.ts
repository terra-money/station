import { debug } from "utils/env"

export const sandbox =
  debug.auth ||
  process.env.REACT_APP_SANDBOX === "true" ||
  navigator.userAgent.includes("Electron")
