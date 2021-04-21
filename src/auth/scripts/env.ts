import { debug } from "utils/env"

export const electron = debug.auth || navigator.userAgent.includes("Electron")
