export const debug = {
  query:
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_DEBUG_QUERY === "true",
  translation:
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_DEBUG_TRANSLATION === "true",
  theme:
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_DEBUG_THEME === "true",
  auth:
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_ELECTRON === "true",
}
