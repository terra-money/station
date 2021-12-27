import TerraApp, { CommonResponse } from "@terra-money/ledger-terra-js"
import { signatureImport } from "secp256k1"
import semver from "semver"

const INTERACTION_TIMEOUT = 120
const REQUIRED_APP_VERSION = "1.0.0"

declare global {
  interface Window {
    google: any
  }
  interface Navigator {
    hid: any
  }
}

class LedgerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LedgerError"
  }
}

let app: TerraApp | null = null
let path: number[] | null = null
let transport: any = null

const handleTransportError = (err: Error) => {
  if (err.message.startsWith("The device is already open")) {
    // ignore this error
    return transport
  }

  if (err.name === "TransportOpenUserCancelled") {
    throw new LedgerError(
      "Couldn't find the Ledger. Check the Ledger is plugged in and unlocked."
    )
  }

  throw err
}

const handleConnectError = (err: Error) => {
  app = path = null

  const message = err.message.trim()

  /* istanbul ignore next: specific error rewrite */
  if (message.startsWith("No WebUSB interface found for the Ledger device")) {
    throw new LedgerError(
      `Couldn't connect to a Ledger device. Use Ledger Live to upgrade the Ledger firmware to version ${REQUIRED_APP_VERSION} or later.`
    )
  }

  /* istanbul ignore next: specific error rewrite */
  if (message.startsWith("Unable to claim interface")) {
    // apparently can't use it in several tabs in parallel
    throw new LedgerError(
      "Couldn't access Ledger device. Is it being used in another tab?"
    )
  }

  /* istanbul ignore next: specific error rewrite */
  if (message.startsWith("Not supported")) {
    throw new LedgerError(
      "This browser doesn't support WebUSB yet. Update it to the latest version."
    )
  }

  /* istanbul ignore next: specific error rewrite */
  if (message.startsWith("No device selected")) {
    throw new LedgerError(
      "Couldn't find the Ledger. Check the Ledger is plugged in and unlocked."
    )
  }

  // throw unknown error
  throw err
}

const checkLedgerErrors = (response: CommonResponse | null) => {
  if (!response) {
    return
  }

  const { error_message, device_locked } = response

  if (device_locked) {
    throw new LedgerError("Ledger's screensaver mode is on")
  }

  if (error_message.startsWith("TransportRaceCondition")) {
    throw new LedgerError("Finish previous action in Ledger")
  } else if (error_message.startsWith("DisconnectedDeviceDuringOperation")) {
    app = path = null
    throw new LedgerError("Open the Terra app in the Ledger")
  }

  switch (error_message) {
    case "U2F: Timeout":
      throw new LedgerError(
        "Couldn't find a connected and unlocked Ledger device"
      )

    case "App does not seem to be open":
      throw new LedgerError("Open the Terra app in the Ledger")

    case "Command not allowed":
      throw new LedgerError("Transaction rejected")

    case "Transaction rejected":
      throw new LedgerError("User rejected the transaction")

    case "Unknown Status Code: 26628":
      throw new LedgerError("Ledger's screensaver mode is on")

    case "Instruction not supported":
      throw new LedgerError(
        "Check the Ledger is running latest version of Terra"
      )

    case "No errors":
      break

    default:
      throw new LedgerError(error_message)
  }
}

async function createTerraApp(): Promise<TerraApp> {
  let app

  checkBrowser(navigator.userAgent)

  if (isWindows(navigator.platform)) {
    // For Windows
    if (!navigator.hid) {
      throw new LedgerError(
        "This browser doesn't have HID enabled. Enable this feature by visiting: chrome://flags/#enable-experimental-web-platform-features"
      )
    }

    const TransportWebHid = require("@ledgerhq/hw-transport-webhid").default
    transport = await TransportWebHid.create(INTERACTION_TIMEOUT * 1000).catch(
      handleTransportError
    )
  } else {
    // For other than Windows
    const TransportWebUsb = require("@ledgerhq/hw-transport-webusb").default
    transport = await TransportWebUsb.create(INTERACTION_TIMEOUT * 1000).catch(
      handleTransportError
    )
  }

  if (transport && typeof transport.on === "function") {
    transport.on("disconnect", () => {
      app = path = transport = null
    })
  }

  app = new TerraApp(transport)

  const result = await app.initialize()
  checkLedgerErrors(result)

  return app
}

const connect = async () => {
  if (app) {
    return
  }

  app = await createTerraApp()
  const { app_name: appName } = app.getInfo()

  if (appName !== "Terra") {
    throw new LedgerError("Open the Terra app in the Ledger")
  }

  const { major, minor, patch } = app.getVersion()
  const version = `${major}.${minor}.${patch}`

  if (appName === "Terra" && semver.lt(version, REQUIRED_APP_VERSION)) {
    throw new LedgerError(
      "Outdated version: Update Ledger Terra App to the latest version"
    )
  }

  path = [44, 330, 0, 0, 0]
}

export const close = async () => {
  if (transport) {
    transport.close()
    app = path = null
  }
}

export const getPubKey = async () => {
  await connect().catch(handleConnectError)

  if (!app) {
    return
  }

  const response = await app.getAddressAndPubKey(path, "terra")
  checkLedgerErrors(response)
  return Buffer.from(response.compressed_pk as any)
}

export const showAddressInLedger = async () => {
  await connect().catch(handleConnectError)

  if (!app) {
    return
  }

  const response = await app.showAddressAndPubKey(path, "terra")
  checkLedgerErrors(response)
}

export const getTerraAddress = async () => {
  await connect().catch(handleConnectError)

  if (!app) {
    return ""
  }

  const response = await app.getAddressAndPubKey(path, "terra")
  checkLedgerErrors(response)
  return response.bech32_address
}

export const sign = async (signMessage: string) => {
  await connect().catch(handleConnectError)

  if (!app) {
    return
  }

  const response = await app.sign(path, signMessage)
  checkLedgerErrors(response)
  return Buffer.from(signatureImport(Buffer.from(response.signature as any)))
}

const isWindows = (platform: string) => platform.indexOf("Win") > -1
const checkBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase()
  const isChrome = /chrome|crios/.test(ua) && !/edge|opr\//.test(ua)
  const isBrave = isChrome && !window.google

  if (!isChrome && !isBrave) {
    throw new LedgerError("This browser doesn't support Ledger devices")
  }

  return isChrome ? "chrome" : "brave"
}
