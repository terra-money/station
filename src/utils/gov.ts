export const isWhitelisted = (url?: string) => {
  if (!url) return false
  if (!url.match(/https?:\/\/.*/)) {
    url = `https://${url}`
  }

  /* common interchain proposal discussion forums or resources */
  const whitelistedDomains = [
    "commonwealth.im",
    "github.com",
    "mintscan.io",
    "terra.dev",
    "terra.money",
    "terragrantsfoundation.org",
  ]

  try {
    const hostname = new URL(url).hostname
    var whitelisted = false

    whitelistedDomains.forEach((domain) => {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        whitelisted = true
      }
    })
    return whitelisted
  } catch (error) {
    return false
  }
}

/* exempted URLs are displayed as written (but not linked) */
export const isExempted = (url?: string) => {
  const exempted = ["terra.py"]
  if (!url) return false

  return exempted.includes(url.toLowerCase())
}

/* match url-like references */
export const URL_REGEX =
  /((?:[a-z0-9-.]*?:\/\/)?(?:[^\s/]+\.[^\s.!?,)\d]{2,}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})|\[(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}\])(?:\S(?=[^\s.!?,)])|[^\s.!?,)])*)/gi
