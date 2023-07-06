import * as amplitude from "@amplitude/analytics-browser"
import packageJson from "../../../package.json"

// Add hook/detection for users to opt out of tracking
export const DONT_TRACK = false
export const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY
// Create generic interface
interface IAmplitudeClient {
  trackEvent: (eventLabel: string, eventOptions?: Record<string, any>) => void
}

// empty tracker
export class NullAmplitudeClient implements IAmplitudeClient {
  trackEvent(eventLabel: string, eventOptions?: Record<string, any>): void {}
}

// live tracker
export class AmplitudeClient implements IAmplitudeClient {
  constructor(apiKey: string) {
    amplitude.init(apiKey, { appVersion: `web-app_${packageJson.version}` })
  }

  trackEvent(eventLabel: string, eventOptions?: Record<string, any>): void {
    amplitude.track(eventLabel, eventOptions)
  }
}

// build client
export const createAmplitudeClient = (): IAmplitudeClient => {
  // if the key isn't found or if the user has opted out of tracking, return a null client
  if (!AMPLITUDE_API_KEY || DONT_TRACK) {
    return new NullAmplitudeClient()
  }

  // otherwise, return a live client
  return new AmplitudeClient(AMPLITUDE_API_KEY)
}
