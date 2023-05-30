import * as Sentry from "@sentry/react"

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN
const ENVIRONMENT = process.env.NODE_ENV

export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: ENVIRONMENT === "development" ? 1.0 : 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })
}
