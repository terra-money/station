import { initSentry } from "./setupSentry"
import { createAmplitudeClient } from "./setupAmplitude"

export const initAnalytics = () => {
  initSentry()
  createAmplitudeClient()
}

export enum AnalyticsEvent {
  LOGIN = "Login",
  LOGOUT = "Logout",
  SIGNUP = "Signup",
  ONBOARDING_START = "Onboarding Start",
  ONBOARDING_COMPLETE = "Onboarding Complete",
  TRASNACTION = "Transaction",
}
