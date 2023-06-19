import * as amplitude from "@amplitude/analytics-browser"

// move to cloudflare env variable
// this value is NOT secret - it is a client API key.
// export const AMPLITUDE_API_KEY = process.env.REACT_APP_AMPLITUDE_API_KEY
export const AMPLITUDE_API_KEY = "cfb5a9de7d2840a3af747c4294b10416"

// Add hook/detection for users to opt out of tracking
export const DONT_TRACK = false

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
    amplitude.init(apiKey)
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
