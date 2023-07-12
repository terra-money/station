import { initSentry } from "./setupSentry"
import { createAmplitudeClient } from "./setupAmplitude"

export const initAnalytics = () => {
  initSentry()
  createAmplitudeClient()
}

export enum AnalyticsEvent {
  TRANSACTION = "Transaction",
}
